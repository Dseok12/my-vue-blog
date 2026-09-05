/** 기본키 생성 - CHAR(36) UUID 를 사용한다. */
import { randomUUID } from 'node:crypto'

export function newId() {
  return randomUUID()
}
