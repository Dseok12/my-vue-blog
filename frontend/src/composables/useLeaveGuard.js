/**
 * 작성 중인 내용이 있을 때 화면을 떠나려 하면 한 번 더 묻는다.
 * - 앱 안에서 다른 화면으로 이동할 때 : 라우터 가드 (onBeforeRouteLeave)
 * - 새로고침 / 탭 닫기 : 브라우저 beforeunload 이벤트
 *
 * 사용: useLeaveGuard(() => dirty.value)  // true 를 돌려주면 확인 창을 띄운다.
 */
import { onBeforeUnmount, onMounted } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

const DEFAULT_MESSAGE = '작성 중인 내용이 사라집니다. 이 화면을 떠날까요?'

export function useLeaveGuard(shouldConfirm, message = DEFAULT_MESSAGE) {
  onBeforeRouteLeave(() => {
    if (!shouldConfirm()) return true
    return window.confirm(message)
  })

  function onBeforeUnload(event) {
    if (!shouldConfirm()) return
    // 브라우저가 자체 확인 창을 띄운다. (문구는 브라우저가 정한다)
    event.preventDefault()
    event.returnValue = ''
  }

  onMounted(() => window.addEventListener('beforeunload', onBeforeUnload))
  onBeforeUnmount(() => window.removeEventListener('beforeunload', onBeforeUnload))
}
