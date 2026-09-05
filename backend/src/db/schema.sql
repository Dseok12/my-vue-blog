-- ---------------------------------------------------------------------------
-- 나만의 다양한 diary - 테이블 정의
--
-- 실행: npm run db:migrate
-- 날짜 규칙
--   date_key   : 사용자가 고른 '한국 시간 기준' 날짜 (DATE, 'YYYY-MM-DD')
--   created_at : 실제로 저장한 시각 (DATETIME, UTC 로 저장)
-- ---------------------------------------------------------------------------

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id            CHAR(36)     NOT NULL,
  email         VARCHAR(191) NOT NULL,
  nickname      VARCHAR(12)  NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at    DATETIME(3)  NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_nickname (nickname)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 다이어리 글
CREATE TABLE IF NOT EXISTS diaries (
  id         CHAR(36)    NOT NULL,
  author_id  CHAR(36)    NOT NULL,
  title      VARCHAR(60) NOT NULL,
  content    TEXT        NOT NULL,
  category   ENUM('diary', 'book', 'emotion')  NOT NULL DEFAULT 'diary',
  mood       VARCHAR(20) NOT NULL DEFAULT '',
  date_key   DATE        NOT NULL,
  visibility ENUM('public', 'private')         NOT NULL DEFAULT 'private',
  created_at DATETIME(3) NOT NULL,
  updated_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_diaries_author_date (author_id, date_key, created_at),
  KEY idx_diaries_public_date (visibility, date_key, created_at),
  CONSTRAINT fk_diaries_author FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 글에 첨부한 이미지 (순서 유지)
CREATE TABLE IF NOT EXISTS diary_images (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  diary_id   CHAR(36)     NOT NULL,
  url        VARCHAR(512) NOT NULL,
  name       VARCHAR(255) NOT NULL DEFAULT '',
  sort_order INT          NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_diary_images_diary (diary_id, sort_order),
  CONSTRAINT fk_diary_images_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 댓글 / 대댓글 (parent_id 가 있으면 대댓글)
CREATE TABLE IF NOT EXISTS comments (
  id         CHAR(36)    NOT NULL,
  diary_id   CHAR(36)    NOT NULL,
  parent_id  CHAR(36)    NULL,
  author_id  CHAR(36)    NOT NULL,
  content    TEXT        NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comments_diary (diary_id, created_at),
  KEY idx_comments_parent (parent_id),
  CONSTRAINT fk_comments_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_author FOREIGN KEY (author_id)
    REFERENCES users (id) ON DELETE CASCADE
  -- 대댓글 삭제는 서비스 코드에서 직접 처리한다.
  -- (MySQL 은 자기 참조 외래키의 연쇄 삭제를 보장하지 않는다)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;

-- 좋아요 (한 사람이 한 글에 한 번)
CREATE TABLE IF NOT EXISTS diary_likes (
  diary_id   CHAR(36)    NOT NULL,
  user_id    CHAR(36)    NOT NULL,
  created_at DATETIME(3) NOT NULL,
  PRIMARY KEY (diary_id, user_id),
  KEY idx_diary_likes_user (user_id),
  CONSTRAINT fk_diary_likes_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE,
  CONSTRAINT fk_diary_likes_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_general_ci;
