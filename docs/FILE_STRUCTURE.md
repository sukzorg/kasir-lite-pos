# Struktur File

Struktur dibuat berbasis fungsi supaya backend, frontend, database, dan dokumentasi tidak saling bercampur.

```text
kasir_lite_POS/
  .env.example
  docker-compose.yml
  package.json
  prd_kasir_lite_pos.md
  README.md
  render.yaml
  apps/
    api/
      package.json
      tsconfig.json
      prisma/
        schema.prisma
        seed.ts
      src/
        app.ts
        server.ts
        config/
          env.ts
          prisma.ts
        middlewares/
          auth.ts
          error-handler.ts
        modules/
          auth/
            auth.routes.ts
          categories/
            categories.routes.ts
          customers/
            customers.routes.ts
          dashboard/
            dashboard.routes.ts
          inventory/
            inventory.controller.ts
            inventory.routes.ts
            inventory.schema.ts
            inventory.service.ts
          products/
            products.controller.ts
            products.routes.ts
            products.schema.ts
            products.service.ts
          sales/
            sales.controller.ts
            sales.routes.ts
            sales.schema.ts
            sales.service.ts
          reports/
            reports.routes.ts
          settings/
            settings.routes.ts
          suppliers/
            suppliers.routes.ts
          users/
            users.routes.ts
        types/
          express.d.ts
        utils/
          async-handler.ts
          http-error.ts
          serializers.ts
          store-context.ts
    web/
      package.json
      vercel.json
      index.html
      vite.config.ts
      tailwind.config.js
      public/
        favicon.svg
      src/
        App.tsx
        main.tsx
        styles.css
        vite-env.d.ts
        api/
          client.ts
          useFallbackQuery.ts
        components/
          layout/
            AppLayout.tsx
          ui/
            EmptyState.tsx
            Modal.tsx
            StatCard.tsx
            StatusBadge.tsx
          ui.tsx
        data/
          fallback.ts
        config/
          plans.ts
        features/
          login/
            components/
              AppLogo.tsx
              FeatureRibbon.tsx
              LoginCard.tsx
              RetailBackdrop.tsx
          pos/
            POSPage.tsx
          transactions/
            components/
              TransactionStatusBadge.tsx
        pages/
          CustomersPage.tsx
          DashboardPage.tsx
          InventoryPage.tsx
          LoginPage.tsx
          MasterDataPage.tsx
          PosPage.tsx
          ProductsPage.tsx
          ReportsPage.tsx
          SettingsPage.tsx
          SuppliersPage.tsx
          TransactionsPage.tsx
          UpgradePage.tsx
        lib/
          alerts.ts
          format.ts
          mockData.ts
        store/
          auth.ts
        types.ts
  docs/
    API.md
    CHANGELOG.md
    DATABASE.md
    FILE_STRUCTURE.md
  deployment/
    README_DEPLOY.md
    security-checklist.md
    aiven/
      mysql-notes.md
    cloudflare/
      dns-checklist.md
    render-api/
      env.example
    vercel-web/
      env.example
```

## Prinsip Pemisahan

- `apps/api/src/modules/*`: setiap domain backend punya route dan validasi sendiri.
- Modul backend yang sudah membesar memakai pola `*.routes.ts`, `*.controller.ts`, `*.schema.ts`, dan `*.service.ts`.
- `apps/api/prisma`: schema database dan seed data.
- `apps/web/src/pages/*`: route-level screen yang dipakai langsung oleh React Router.
- `apps/web/src/features/*/components`: komponen lokal untuk fitur yang UI-nya mulai kompleks.
- `apps/web/src/features/pos`: implementasi POS dipisah karena interaksi keranjang lebih besar.
- `apps/web/src/components/layout`: shell aplikasi, sidebar, topbar, dan navigasi.
- `apps/web/src/components/ui`: komponen UI reusable kecil.
- `apps/web/src/data`: fallback data untuk mode demo tanpa backend.
- `apps/web/src/config`: konfigurasi frontend, termasuk pembatasan paket `free` dan `full`.
- `apps/web/src/lib`: formatter, mock data pendukung, dan helper alert SweetAlert2.
- `apps/web/public`: asset publik seperti favicon.
- `render.yaml`: Blueprint Render untuk deploy API dari monorepo.
- `apps/web/vercel.json`: rewrite SPA dan security headers untuk deploy Vercel.
- `deployment`: panduan deploy dan contoh environment terpisah agar source inti tetap rapi.
- `deployment/security-checklist.md`: checklist keamanan sebelum demo public.
- `docs`: catatan teknis yang harus ikut diperbarui saat ada perubahan besar.

## Catatan Pengembangan Lanjutan

- Modul besar sudah mulai memakai `*.service.ts`, `*.schema.ts`, dan `*.controller.ts`.
- Feature login dan transaksi sudah memakai `components` lokal.
- `storeId` sudah tersedia di tabel transaksional utama dan dikirim dari frontend via `X-Store-Id`.
- Modul Master Data sudah dipisah sebagai route khusus Owner di `apps/web/src/pages/MasterDataPage.tsx`.
- Loyalty rule tersimpan di database dan diakses melalui `/settings/loyalty`.
- Modul berbayar dikunci melalui `apps/web/src/config/plans.ts` dan halaman upgrade di `UpgradePage.tsx`.
