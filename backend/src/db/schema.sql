-- ---------------------------------------------------------------------------
-- 나만의 다양한 diary - 테이블 정의
-- 모든 시각(DATETIME)은 UTC 로 저장하고, 화면에 쓰는 날짜(date_key)는
-- 한국 시간(KST) 기준 'YYYY-MM-DD' 문자열로 따로 저장한다.
-- ---------------------------------------------------------------------------

-- 회원
CREATE TABLE IF NOT EXISTS users (
  id            BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  email         VARCHAR(255)    NOT NULL,
  password_hash VARCHAR(255)    NOT NULL,
  nickname      VARCHAR(12)     NOT NULL,
  created_at    DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_nickname (nickname)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 다이어리 글
CREATE TABLE IF NOT EXISTS diaries (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id    BIGINT UNSIGNED NOT NULL,
  title      VARCHAR(60)     NOT NULL,
  content    TEXT            NOT NULL,
  category   ENUM('diary', 'book', 'emotion')  NOT NULL DEFAULT 'diary',
  mood       VARCHAR(20)     NOT NULL DEFAULT '',
  date_key   CHAR(10)        NOT NULL,
  visibility ENUM('public', 'private')         NOT NULL DEFAULT 'private',
  created_at DATETIME(3)     NOT NULL,
  updated_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_diaries_user_date (user_id, date_key),
  KEY idx_diaries_public_date (visibility, date_key),
  CONSTRAINT fk_diaries_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 다이어리에 첨부한 이미지
CREATE TABLE IF NOT EXISTS diary_images (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  diary_id   BIGINT UNSIGNED NOT NULL,
  url        VARCHAR(512)    NOT NULL,
  name       VARCHAR(255)    NOT NULL,
  sort_order INT             NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_diary_images_diary (diary_id, sort_order),
  CONSTRAINT fk_diary_images_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 댓글 / 대댓글 (parent_id 가 있으면 대댓글)
CREATE TABLE IF NOT EXISTS comments (
  id         BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  diary_id   BIGINT UNSIGNED NOT NULL,
  parent_id  BIGINT UNSIGNED NULL DEFAULT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  content    VARCHAR(1000)   NOT NULL,
  created_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (id),
  KEY idx_comments_diary (diary_id, created_at),
  KEY idx_comments_parent (parent_id),
  CONSTRAINT fk_comments_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id)
    REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;

-- 좋아요 (회원 한 명당 글 하나에 한 번)
CREATE TABLE IF NOT EXISTS diary_likes (
  diary_id   BIGINT UNSIGNED NOT NULL,
  user_id    BIGINT UNSIGNED NOT NULL,
  created_at DATETIME(3)     NOT NULL,
  PRIMARY KEY (diary_id, user_id),
  KEY idx_diary_likes_user (user_id),
  CONSTRAINT fk_diary_likes_diary FOREIGN KEY (diary_id)
    REFERENCES diaries (id) ON DELETE CASCADE,
  CONSTRAINT fk_diary_likes_user FOREIGN KEY (user_id)
    REFERENCES users (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
