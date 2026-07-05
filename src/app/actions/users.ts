'use server'

import { createServiceClient, createClient } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateUserRole(userId: string, newRole: string) {
  // First, verify the caller has permission (is webmaster or admin)
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: callerProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const callerRole = callerProfile?.role
  if (callerRole !== 'webmaster' && callerRole !== 'admin') {
    return { success: false, error: 'Permission denied. Only admins can change roles.' }
  }

  // Use service client to bypass RLS for updating another user's profile
  const supabaseAdmin = createServiceClient()
  
  if (newRole === 'admin') {
    const { data: existingAdmins, error: countError } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('role', 'admin')
      
    if (countError) {
      return { success: false, error: 'Failed to verify existing admins.' }
    }
    
    const otherAdmins = existingAdmins.filter(admin => admin.id !== userId)
    if (otherAdmins.length > 0) {
      return { success: false, error: 'Only 1 admin is allowed at a time. Please remove the current admin before assigning a new one.' }
    }
  }
  
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ role: newRole })
    .eq('id', userId)

  if (error) {
    console.error('Error updating role:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard/users')
  return { success: true }
}
