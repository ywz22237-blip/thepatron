'use client'

import { useEffect } from 'react'

declare global {
  interface Window {
    ChannelIO?: (...args: unknown[]) => void
    ChannelIOInitialized?: boolean
  }
}

interface ChannelTalkProps {
  pluginKey: string
  userId?: string
  userEmail?: string
  userName?: string
}

export function ChannelTalk({ pluginKey, userId, userEmail, userName }: ChannelTalkProps) {
  useEffect(() => {
    // 중복 로드 방지
    if (window.ChannelIOInitialized) {
      window.ChannelIO?.('updateUser', {
        profile: { name: userName, email: userEmail },
      })
      return
    }

    // 채널톡 부트스트랩 스니펫
    ;(function () {
      const w = window
      if (w.ChannelIO) return
      const d = window.document

      const ch = function (...args: unknown[]) {
        ch.c(args)
      }
      ch.q = [] as unknown[][]
      ch.c = function (args: unknown[]) {
        ch.q.push(args)
      }
      w.ChannelIO = ch as typeof w.ChannelIO

      function loadScript() {
        if (w.ChannelIOInitialized) return
        w.ChannelIOInitialized = true

        const s = d.createElement('script')
        s.type = 'text/javascript'
        s.async = true
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js'
        s.charset = 'UTF-8'
        const x = d.getElementsByTagName('script')[0]
        x.parentNode?.insertBefore(s, x)
      }

      if (d.readyState === 'complete') {
        loadScript()
      } else if (w.attachEvent) {
        w.attachEvent('onload', loadScript)
      } else {
        w.addEventListener('DOMContentLoaded', loadScript, false)
        w.addEventListener('load', loadScript, false)
      }
    })()

    window.ChannelIO?.('boot', {
      pluginKey,
      memberId: userId,
      profile: {
        name: userName,
        email: userEmail,
      },
      customLauncherSelector: undefined,
      hideChannelButtonOnBoot: false,
      language: 'ko',
      zIndex: 9999,
    })

    return () => {
      window.ChannelIO?.('shutdown')
    }
  }, [pluginKey, userId, userEmail, userName])

  return null
}
