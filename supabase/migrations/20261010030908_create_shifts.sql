-- Optional: If you have a custom enum type for shift status, uncomment the line below
-- CREATE TYPE shift_status AS ENUM ('open', 'filled', 'cancelled', 'completed');

CREATE TABLE shifts (
    shift_id uuid PRIMARY KEY,
    profile_id uuid NOT NULL,
    shift_name text NOT NULL,
    shift_date date NOT NULL,
    start_time time NOT NULL,
    end_time time NOT NULL,
    required_workers integer NOT NULL DEFAULT 1,
    notes text,
    shift_status text NOT NULL, 
    created_at timestamptz NOT NULL DEFAULT NOW(),
    updated_at timestamptz NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profiles(id)
);
