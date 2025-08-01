export interface User {
  id: string;
  username: string;
  password: string;
  role:
    | "BOD-1"
    | "KSPI"
    | "SEKPER"
    | "VP AGA"
    | "VP KEU"
    | "VP OP"
    | "SUPER_ADMIN";
  name: string;
}

export interface Arahan {
  id: string;
  title: string;
  description: string;
  division: string;
  pic: string;
  status: "selesai" | "selesai_berkelanjutan" | "dalam_proses";
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  categoryName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTableData {
  id: string;
  division: string;
  jumlah: number;
  proses: number;
  selesai: number;
  belumDitindaklanjuti: number;
  selesaiBerkelanjutan: number;
  progress: number;
  status?: string;
  targetPenyelesaian?: string;
  detailArahan?: string;
  checkPoint?: string;
  deskripsiTindakLanjut?: string;
  catatanSekretaris?: string;
  uploadedFiles?: string;
  fileNames?: string;
}

export interface CategoryTable {
  id: string;
  categoryName: string;
  description: string;
  tableData: CategoryTableData[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalArahan: number;
  selesai: number;
  selesaiBerkelanjutan: number;
  dalamProses: number;
  belumDitindaklanjuti: number;
}

export interface TindakLanjut {
  id: string;
  kategoriArahan: string;
  detailArahan: string;
  pic: string;
  target: string;
  status: "belum_ditindaklanjuti" | "dalam_proses" | "selesai" | "selesai_berkelanjutan";
  deskripsiTindakLanjut: string;
  catatanSekretaris: string;
  categoryId: string;
  division: string;
  fileAttachment?: string;
  createdAt: string;
  updatedAt: string;
}
