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
