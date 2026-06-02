# VTI 9-Year Adventure - Kaizen Journey

Game 2D side-scrolling endless runner theo chặng cho AI Gameathon 2026, do Kaizen Delivery Squad phát triển nhân dịp kỷ niệm 9 năm VTI Group.

Thông điệp chủ đạo: **"VTI 9 Năm - Công nghệ kiến tạo giá trị mới"**.

## Documentation

- [Documentation Index](./docs/README.md)
- [GDD](./docs/GDD/GDD.md): thiết kế trải nghiệm, world, art direction, cutscene và Stitch pipeline.
- [SRS](./docs/SRS/SRS.md): yêu cầu chức năng, gameplay rules, kỹ thuật, Supabase, auth, scoring và testing.
- [World Design](./docs/GDD/01_World_Design.md): chi tiết 3 map Hà Nội, Tokyo, Đà Nẵng.
- [Stitch Asset Plan](./docs/GDD/02_Stitch_Asset_Plan.md): danh sách asset/frame cần sinh bằng Stitch.

## Current Direction

- Next.js App Router.
- HTML5 Canvas thuần cho gameplay runtime.
- Supabase cho Google SSO, leaderboard và CMS config.
- Google SSO giới hạn email `@vti.com.vn`.
- Stitch dùng để sinh frame nhân vật, item, enemy, boss, obstacle và cutscene art.
