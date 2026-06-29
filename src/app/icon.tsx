import { ImageResponse } from 'next/og'
import { readFileSync } from 'fs'
import { join } from 'path'

export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  // Read the original icon file
  const iconPath = join(process.cwd(), 'src', 'app', 'icon-source.png')
  const iconData = readFileSync(iconPath)
  const base64Data = iconData.toString('base64')
  const imgSrc = `data:image/png;base64,${base64Data}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4px', // padding shrinks the inner image
        }}
      >
        <img
          src={imgSrc}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
    ),
    { ...size }
  )
}
