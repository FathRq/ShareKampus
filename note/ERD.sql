-- ============================================================================
-- ERD.sql — Database Schema (Supabase PostgreSQL + PostGIS)
-- Project: ShareKampus — Platform Barter & Pinjam Alat/Buku Kuliah
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. TABLE: campuses (level INSTITUSI, bukan lokasi fisik)
-- Satu baris = satu universitas/institusi, diidentifikasi lewat domain email
-- resmi. Satu institusi BISA punya banyak lokasi fisik (lihat campus_locations
-- di bawah) -- contoh: UNESA satu domain (@mhs.unesa.ac.id) tapi 5 kampus fisik.
-- ============================================================================
CREATE TABLE campuses (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(150) NOT NULL,                 -- ex: 'Universitas Negeri Surabaya'
    email_domain    VARCHAR(100) NOT NULL UNIQUE,           -- ex: 'mhs.unesa.ac.id'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- 1B. TABLE: campus_locations (level LOKASI FISIK)
-- Titik geospasial nyata yang dipakai untuk geofencing (FR-02). Satu campus
-- (institusi) bisa punya banyak baris di sini -- satu per kampus fisik.
-- ============================================================================
CREATE TABLE campus_locations (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campus_id       UUID NOT NULL REFERENCES campuses(id) ON DELETE CASCADE,
    name            VARCHAR(150) NOT NULL,                 -- ex: 'Kampus 1 - Ketintang'
    location        GEOGRAPHY(Point, 4326) NOT NULL,        -- titik koordinat kampus (lng, lat)
    radius_meter    INTEGER NOT NULL DEFAULT 2500,          -- radius default geofencing (2.5 km)
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_campus_locations_location ON campus_locations USING GIST (location);
CREATE INDEX idx_campus_locations_campus_id ON campus_locations(campus_id);

-- ============================================================================
-- 2. TABLE: users
-- Menyimpan data mahasiswa terverifikasi + Trust Score
-- ============================================================================
-- CATATAN: Autentikasi ditangani oleh Supabase Auth (skema `auth.users`), bukan
-- oleh tabel ini. Tabel `users` di sini adalah PROFIL yang wajib dibuat oleh
-- Go backend tepat setelah proses signup ke Supabase Auth berhasil, memakai
-- `id` yang sama dengan `auth.users.id`. Password hashing, refresh token, dan
-- verifikasi email sepenuhnya dikelola Supabase Auth.
CREATE TABLE users (
    id                  UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    campus_id           UUID NOT NULL REFERENCES campuses(id) ON DELETE RESTRICT,
    campus_location_id  UUID REFERENCES campus_locations(id) ON DELETE SET NULL, -- kampus fisik pilihan mahasiswa saat daftar
    full_name           VARCHAR(150) NOT NULL,
    email               VARCHAR(150) NOT NULL UNIQUE,       -- wajib domain kampus, divalidasi di Go backend sebelum signup
    avatar_url          TEXT,
    phone_number        VARCHAR(20),
    default_location    GEOGRAPHY(Point, 4326),             -- lokasi terakhir yang di-share pengguna
    trust_score         NUMERIC(5,2) NOT NULL DEFAULT 50.00 CHECK (trust_score >= 0 AND trust_score <= 100),
    total_saved_amount  NUMERIC(14,2) NOT NULL DEFAULT 0,    -- agregat kontribusi expense saver dari sisi user ini
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_campus_id ON users(campus_id);
CREATE INDEX idx_users_location ON users USING GIST (default_location);

-- ============================================================================
-- 3. TABLE: items
-- Katalog barang yang dipinjamkan/dibarter
-- ============================================================================
CREATE TYPE item_category AS ENUM ('buku', 'alat_lab', 'elektronik', 'lainnya');
CREATE TYPE item_transaction_type AS ENUM ('pinjam', 'barter', 'keduanya');
CREATE TYPE item_status AS ENUM ('available', 'on_transaction', 'unavailable');

CREATE TABLE items (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    resource_code       VARCHAR(20) UNIQUE,                 -- ex: 'SK-BK-00125', auto-generate lewat trigger
    owner_id            UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title               VARCHAR(150) NOT NULL,
    description         TEXT,
    category            item_category NOT NULL,
    transaction_type    item_transaction_type NOT NULL DEFAULT 'pinjam',
    market_price        NUMERIC(12,2) NOT NULL DEFAULT 0,   -- estimasi harga baru (dipakai di formula E_saved)
    location            GEOGRAPHY(Point, 4326) NOT NULL,     -- titik serah-terima/lokasi barang
    status              item_status NOT NULL DEFAULT 'available',
    max_loan_days       INTEGER NOT NULL DEFAULT 7,          -- batas hari pinjam sebelum dianggap overdue
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_items_owner_id ON items(owner_id);
CREATE INDEX idx_items_location ON items USING GIST (location);
CREATE INDEX idx_items_status ON items(status);
CREATE INDEX idx_items_category ON items(category);

-- ============================================================================
-- 3B. TABLE: item_photos
-- Satu barang (items) bisa punya BANYAK foto -- setiap baris di sini adalah
-- satu foto, diurutkan lewat sort_order (foto pertama = cover/thumbnail utama).
-- ============================================================================
CREATE TABLE item_photos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id         UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    photo_url       TEXT NOT NULL,
    sort_order      INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_item_photos_item_id ON item_photos(item_id);

-- ============================================================================
-- 4. TABLE: transactions
-- Siklus transaksi pinjam/barter antar dua mahasiswa
-- ============================================================================
CREATE TYPE transaction_status AS ENUM ('pending', 'active', 'returned', 'overdue', 'rejected', 'cancelled');

CREATE TABLE transactions (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    item_id             UUID NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    borrower_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lender_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status              transaction_status NOT NULL DEFAULT 'pending',
    actual_cost         NUMERIC(12,2) NOT NULL DEFAULT 0,    -- C_i pada formula E_saved (0 jika gratis)
    agreed_return_date  DATE,
    returned_at         TIMESTAMPTZ,
    meeting_point       GEOGRAPHY(Point, 4326),              -- titik temu serah-terima, dalam radius kampus
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_borrower_lender_diff CHECK (borrower_id <> lender_id)
);

CREATE INDEX idx_transactions_item_id ON transactions(item_id);
CREATE INDEX idx_transactions_borrower_id ON transactions(borrower_id);
CREATE INDEX idx_transactions_lender_id ON transactions(lender_id);
CREATE INDEX idx_transactions_status ON transactions(status);

-- ============================================================================
-- 5. TABLE: reviews
-- Ulasan pasca-transaksi, jadi input utama Trust Score Engine
-- ============================================================================
CREATE TABLE reviews (
    id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id      UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    reviewer_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reviewee_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (transaction_id, reviewer_id)  -- satu reviewer hanya bisa 1 ulasan per transaksi
);

CREATE INDEX idx_reviews_reviewee_id ON reviews(reviewee_id);
CREATE INDEX idx_reviews_transaction_id ON reviews(transaction_id);

-- ============================================================================
-- 6. STORED FUNCTION: Get Nearby Items (Geofencing Query)
-- Mengembalikan daftar barang dalam radius tertentu dari titik koordinat user
-- ============================================================================
CREATE OR REPLACE FUNCTION get_nearby_items(
    user_lat        DOUBLE PRECISION,
    user_lng        DOUBLE PRECISION,
    radius_meter    INTEGER DEFAULT 2500,
    filter_category item_category DEFAULT NULL
)
RETURNS TABLE (
    item_id         UUID,
    title           VARCHAR,
    category        item_category,
    transaction_type item_transaction_type,
    market_price    NUMERIC,
    photo_url       TEXT,
    status          item_status,
    owner_id        UUID,
    owner_name      VARCHAR,
    owner_trust_score NUMERIC,
    distance_meter  DOUBLE PRECISION
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        i.id,
        i.title,
        i.category,
        i.transaction_type,
        i.market_price,
        i.photo_url,
        i.status,
        u.id,
        u.full_name,
        u.trust_score,
        ST_Distance(
            i.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
        ) AS distance_meter
    FROM items i
    JOIN users u ON u.id = i.owner_id
    WHERE
        i.status = 'available'
        AND ST_DWithin(
            i.location,
            ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
            radius_meter
        )
        AND (filter_category IS NULL OR i.category = filter_category)
    ORDER BY distance_meter ASC;
END;
$$;

-- Contoh pemanggilan:
-- SELECT * FROM get_nearby_items(-7.2814, 112.7211, 2500, 'alat_lab');

-- ============================================================================
-- 7. STORED FUNCTION: Recalculate Trust Score
-- Menghitung ulang trust score seorang user berdasarkan formula di ARCH.md
-- TS = 100 * (0.4 * (avg_rating/5) + 0.4 * on_time_ratio + 0.2 * completion_ratio)
-- ============================================================================
CREATE OR REPLACE FUNCTION recalculate_trust_score(target_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
    avg_rating          NUMERIC := 0;
    on_time_ratio       NUMERIC := 0;
    completion_ratio    NUMERIC := 0;
    total_as_borrower   INTEGER := 0;
    on_time_count       INTEGER := 0;
    total_requested     INTEGER := 0;
    total_completed     INTEGER := 0;
    new_score           NUMERIC := 50.00;
BEGIN
    -- Rata-rata rating yang diterima
    SELECT COALESCE(AVG(rating), 0) INTO avg_rating
    FROM reviews WHERE reviewee_id = target_user_id;

    -- On-Time Return Ratio (sebagai peminjam)
    SELECT COUNT(*) INTO total_as_borrower
    FROM transactions
    WHERE borrower_id = target_user_id AND status IN ('returned', 'overdue');

    SELECT COUNT(*) INTO on_time_count
    FROM transactions
    WHERE borrower_id = target_user_id
      AND status = 'returned'
      AND returned_at::date <= agreed_return_date;

    IF total_as_borrower > 0 THEN
        on_time_ratio := on_time_count::NUMERIC / total_as_borrower;
    END IF;

    -- Completion Ratio (sebagai peminjam maupun pemilik)
    SELECT COUNT(*) INTO total_requested
    FROM transactions
    WHERE borrower_id = target_user_id OR lender_id = target_user_id;

    SELECT COUNT(*) INTO total_completed
    FROM transactions
    WHERE (borrower_id = target_user_id OR lender_id = target_user_id)
      AND status = 'returned';

    IF total_requested > 0 THEN
        completion_ratio := total_completed::NUMERIC / total_requested;
    END IF;

    -- Jika belum ada riwayat sama sekali, tetap skor netral default
    IF total_requested = 0 THEN
        RETURN 50.00;
    END IF;

    new_score := 100 * (0.4 * (avg_rating / 5) + 0.4 * on_time_ratio + 0.2 * completion_ratio);
    new_score := LEAST(GREATEST(new_score, 0.00), 100.00);

    UPDATE users SET trust_score = new_score, updated_at = now() WHERE id = target_user_id;

    RETURN new_score;
END;
$$;

-- ============================================================================
-- 8. STORED FUNCTION: Get Expense Saver Total (Community Aggregate)
-- E_saved = SUM(market_price - actual_cost) untuk transaksi berstatus 'returned'
-- ============================================================================
CREATE OR REPLACE FUNCTION get_expense_saver_total()
RETURNS NUMERIC
LANGUAGE sql
AS $$
    SELECT COALESCE(SUM(i.market_price - t.actual_cost), 0)
    FROM transactions t
    JOIN items i ON i.id = t.item_id
    WHERE t.status = 'returned';
$$;

-- Contoh pemanggilan:
-- SELECT get_expense_saver_total();

-- ============================================================================
-- 9. TRIGGER: Auto-update `updated_at`
-- ============================================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_items_updated_at BEFORE UPDATE ON items
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================================
-- 9B. TRIGGER: Auto-generate resource_code (format: SK-<KATEGORI>-<5 digit>)
-- ============================================================================
CREATE SEQUENCE IF NOT EXISTS items_resource_seq START 1;

CREATE OR REPLACE FUNCTION generate_resource_code()
RETURNS TRIGGER AS $$
DECLARE
    cat_code    TEXT;
    seq_number  BIGINT;
BEGIN
    cat_code := CASE NEW.category
        WHEN 'buku' THEN 'BK'
        WHEN 'alat_lab' THEN 'AL'
        WHEN 'elektronik' THEN 'EL'
        ELSE 'LN'
    END;

    seq_number := nextval('items_resource_seq');

    NEW.resource_code := 'SK-' || cat_code || '-' || LPAD(seq_number::TEXT, 5, '0');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_resource_code
    BEFORE INSERT ON items
    FOR EACH ROW
    WHEN (NEW.resource_code IS NULL)
    EXECUTE FUNCTION generate_resource_code();

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS) — DASAR (aktifkan & sesuaikan policy di Supabase)
-- ============================================================================
ALTER TABLE campus_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Foto barang bersifat publik (siapa saja boleh lihat, sama seperti item-nya)
CREATE POLICY item_photos_select_all ON item_photos
    FOR SELECT USING (true);

-- Daftar lokasi kampus bersifat publik (dipakai dropdown pilihan saat registrasi)
CREATE POLICY campus_locations_select_all ON campus_locations
    FOR SELECT USING (true);

-- Contoh policy: user hanya bisa update data profilnya sendiri
CREATE POLICY users_update_own ON users
    FOR UPDATE USING (auth.uid() = id);

-- Contoh policy: siapa saja (yang login) boleh melihat item yang berstatus available
CREATE POLICY items_select_available ON items
    FOR SELECT USING (status = 'available' OR owner_id = auth.uid());

-- Catatan: policy detail lain (INSERT/DELETE granular per tabel) disesuaikan
-- lebih lanjut oleh tim backend sesuai kebutuhan endpoint di API_CONTRACT.md