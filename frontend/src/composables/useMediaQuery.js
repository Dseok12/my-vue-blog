/**
 * 화면 폭 같은 미디어 쿼리가 맞는지 반응형 값으로 알려 준다.
 * 사용: const isNarrow = useMediaQuery('(max-width: 1023px)')
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

export function useMediaQuery(query) {
  const matches = ref(false)
  let mediaQuery = null

  function onChange(event) {
    matches.value = event.matches
  }

  onMounted(() => {
    mediaQuery = window.matchMedia(query)
    matches.value = mediaQuery.matches
    mediaQuery.addEventListener('change', onChange)
  })

  // 등록한 이벤트는 컴포넌트가 사라질 때 반드시 해제한다.
  onBeforeUnmount(() => {
    mediaQuery?.removeEventListener('change', onChange)
  })

  return matches
}
