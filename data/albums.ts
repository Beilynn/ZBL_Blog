// 自动生成：由 generate-albums.ps1 扫描 public/photos 生成，请勿手动修改
export interface Photo { url: string; caption?: string; }
export interface Album { id: string; title: string; description: string; cover: string; date: string; photos: Photo[]; }

export const albums: Album[] = [
  {
    id: "scenery",
    title: "🌄 风景照",
    description: "天空、山水与沿途的光",
    cover: "/photos/scenery/01.jpg",
    date: "2026.10",
    photos: [
      { url: "/photos/scenery/01.jpg" },
      { url: "/photos/scenery/02.jpg" },
      { url: "/photos/scenery/03.jpg" },
      { url: "/photos/scenery/04.jpg" },
      { url: "/photos/scenery/05.jpg" },
      { url: "/photos/scenery/06.jpg" },
      { url: "/photos/scenery/07.jpg" },
      { url: "/photos/scenery/08.jpg" },
      { url: "/photos/scenery/09.jpg" },
      { url: "/photos/scenery/10.jpg" },
      { url: "/photos/scenery/11.jpg" },
      { url: "/photos/scenery/12.jpg" },
      { url: "/photos/scenery/13.jpg" },
    ],
  },
  {
    id: "animals",
    title: "🐾 可爱小动物",
    description: "毛茸茸的治愈瞬间",
    cover: "/photos/animals/01.jpg",
    date: "2026.10",
    photos: [
      { url: "/photos/animals/01.jpg" },
      { url: "/photos/animals/02.jpg" },
      { url: "/photos/animals/03.jpg" },
      { url: "/photos/animals/04.jpg" },
      { url: "/photos/animals/05.jpg" },
      { url: "/photos/animals/06.jpg" },
      { url: "/photos/animals/07.jpg" },
      { url: "/photos/animals/08.jpg" },
      { url: "/photos/animals/09.jpg" },
      { url: "/photos/animals/10.jpg" },
      { url: "/photos/animals/11.jpg" },
      { url: "/photos/animals/12.jpg" },
      { url: "/photos/animals/13.jpg" },
      { url: "/photos/animals/14.jpg" },
      { url: "/photos/animals/15.jpg" },
    ],
  },
  {
    id: "wallpaper",
    title: "🖼️ 壁纸收藏",
    description: "喜欢的桌面与手机壁纸",
    cover: "/photos/wallpaper/01.jpg",
    date: "2026.10",
    photos: [
      { url: "/photos/wallpaper/01.jpg" },
      { url: "/photos/wallpaper/02.jpg" },
      { url: "/photos/wallpaper/03.jpg" },
      { url: "/photos/wallpaper/04.jpg" },
    ],
  },
];

