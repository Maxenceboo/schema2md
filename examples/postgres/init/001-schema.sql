-- Schema: shop (public)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.users IS 'Registered users';
COMMENT ON COLUMN public.users.email IS 'Login email';

CREATE TABLE IF NOT EXISTS public.orders (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.users(id),
  placed_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT NOW()
);
COMMENT ON TABLE public.orders IS 'Orders placed by users';

CREATE TABLE IF NOT EXISTS public.line_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES public.orders(id),
  sku VARCHAR(64) NOT NULL,
  qty INTEGER NOT NULL CHECK (qty > 0)
);
COMMENT ON TABLE public.line_items IS 'Products within orders';
