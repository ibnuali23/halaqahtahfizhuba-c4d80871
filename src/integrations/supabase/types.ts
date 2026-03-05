export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      absensi_guru: {
        Row: {
          alamat_lokasi: string | null
          created_at: string
          gps_latitude: number | null
          gps_longitude: number | null
          id: string
          keterangan: string | null
          photo_proof_url: string | null
          status: Database["public"]["Enums"]["attendance_status"]
          tanggal: string
          updated_at: string
          user_id: string
          waktu_check_in: string | null
          waktu_check_out: string | null
          waktu_halaqah: Database["public"]["Enums"]["waktu_halaqah"] | null
        }
        Insert: {
          alamat_lokasi?: string | null
          created_at?: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          keterangan?: string | null
          photo_proof_url?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          tanggal?: string
          updated_at?: string
          user_id: string
          waktu_check_in?: string | null
          waktu_check_out?: string | null
          waktu_halaqah?: Database["public"]["Enums"]["waktu_halaqah"] | null
        }
        Update: {
          alamat_lokasi?: string | null
          created_at?: string
          gps_latitude?: number | null
          gps_longitude?: number | null
          id?: string
          keterangan?: string | null
          photo_proof_url?: string | null
          status?: Database["public"]["Enums"]["attendance_status"]
          tanggal?: string
          updated_at?: string
          user_id?: string
          waktu_check_in?: string | null
          waktu_check_out?: string | null
          waktu_halaqah?: Database["public"]["Enums"]["waktu_halaqah"] | null
        }
        Relationships: []
      }
      hafalan_log: {
        Row: {
          action: string
          id: string
          new_data: Json | null
          old_data: Json | null
          performed_at: string
          performed_by: string
          reason: string | null
          setoran_id: string
        }
        Insert: {
          action: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by: string
          reason?: string | null
          setoran_id: string
        }
        Update: {
          action?: string
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          performed_at?: string
          performed_by?: string
          reason?: string | null
          setoran_id?: string
        }
        Relationships: []
      }
      hafalan_summary: {
        Row: {
          agustus: number | null
          april: number | null
          created_at: string
          desember: number | null
          februari: number | null
          id: string
          januari: number | null
          juli: number | null
          juni: number | null
          maret: number | null
          mei: number | null
          november: number | null
          oktober: number | null
          santri_id: string
          september: number | null
          setoran_terakhir: string | null
          tahun: number
          target_bulanan: number | null
          total_hafalan: number | null
          updated_at: string
        }
        Insert: {
          agustus?: number | null
          april?: number | null
          created_at?: string
          desember?: number | null
          februari?: number | null
          id?: string
          januari?: number | null
          juli?: number | null
          juni?: number | null
          maret?: number | null
          mei?: number | null
          november?: number | null
          oktober?: number | null
          santri_id: string
          september?: number | null
          setoran_terakhir?: string | null
          tahun: number
          target_bulanan?: number | null
          total_hafalan?: number | null
          updated_at?: string
        }
        Update: {
          agustus?: number | null
          april?: number | null
          created_at?: string
          desember?: number | null
          februari?: number | null
          id?: string
          januari?: number | null
          juli?: number | null
          juni?: number | null
          maret?: number | null
          mei?: number | null
          november?: number | null
          oktober?: number | null
          santri_id?: string
          september?: number | null
          setoran_terakhir?: string | null
          tahun?: number
          target_bulanan?: number | null
          total_hafalan?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hafalan_summary_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      halaqah_locations: {
        Row: {
          alamat: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          nama: string
          radius_meter: number | null
          updated_at: string
          waktu_halaqah: Database["public"]["Enums"]["waktu_halaqah"]
        }
        Insert: {
          alamat?: string | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          nama: string
          radius_meter?: number | null
          updated_at?: string
          waktu_halaqah: Database["public"]["Enums"]["waktu_halaqah"]
        }
        Update: {
          alamat?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          nama?: string
          radius_meter?: number | null
          updated_at?: string
          waktu_halaqah?: Database["public"]["Enums"]["waktu_halaqah"]
        }
        Relationships: []
      }
      pengaturan_sistem: {
        Row: {
          created_at: string
          id: string
          laporan_mingguan: boolean
          last_updated_at: string
          last_updated_by: string | null
          peringatan_target: boolean
          semester_aktif: string
          tahun_ajaran: string
          target_hafalan_bulanan: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          laporan_mingguan?: boolean
          last_updated_at?: string
          last_updated_by?: string | null
          peringatan_target?: boolean
          semester_aktif?: string
          tahun_ajaran?: string
          target_hafalan_bulanan?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          laporan_mingguan?: boolean
          last_updated_at?: string
          last_updated_by?: string | null
          peringatan_target?: boolean
          semester_aktif?: string
          tahun_ajaran?: string
          target_hafalan_bulanan?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          musyrif_nama: string | null
          nama: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          musyrif_nama?: string | null
          nama: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          musyrif_nama?: string | null
          nama?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      riwayat_halaqah: {
        Row: {
          created_at: string
          diubah_oleh: string
          halaqah_baru: string
          halaqah_sebelumnya: string
          id: string
          keterangan: string | null
          santri_id: string
          tanggal_perubahan: string
        }
        Insert: {
          created_at?: string
          diubah_oleh: string
          halaqah_baru: string
          halaqah_sebelumnya: string
          id?: string
          keterangan?: string | null
          santri_id: string
          tanggal_perubahan?: string
        }
        Update: {
          created_at?: string
          diubah_oleh?: string
          halaqah_baru?: string
          halaqah_sebelumnya?: string
          id?: string
          keterangan?: string | null
          santri_id?: string
          tanggal_perubahan?: string
        }
        Relationships: [
          {
            foreignKeyName: "riwayat_halaqah_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      santri: {
        Row: {
          created_at: string
          id: string
          kelas: Database["public"]["Enums"]["kelas_type"]
          musyrif: string
          nama: string
          status: string | null
          updated_at: string
          wali_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          kelas: Database["public"]["Enums"]["kelas_type"]
          musyrif: string
          nama: string
          status?: string | null
          updated_at?: string
          wali_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          kelas?: Database["public"]["Enums"]["kelas_type"]
          musyrif?: string
          nama?: string
          status?: string | null
          updated_at?: string
          wali_id?: string | null
        }
        Relationships: []
      }
      setoran_hafalan: {
        Row: {
          ayat: string | null
          bulan: string
          created_at: string
          id: string
          jumlah_halaman: number
          keterangan: string | null
          recorded_by: string | null
          santri_id: string
          surat: string | null
          tahun: number
          tanggal: string
          total_juz: number | null
          updated_at: string
        }
        Insert: {
          ayat?: string | null
          bulan: string
          created_at?: string
          id?: string
          jumlah_halaman?: number
          keterangan?: string | null
          recorded_by?: string | null
          santri_id: string
          surat?: string | null
          tahun: number
          tanggal?: string
          total_juz?: number | null
          updated_at?: string
        }
        Update: {
          ayat?: string | null
          bulan?: string
          created_at?: string
          id?: string
          jumlah_halaman?: number
          keterangan?: string | null
          recorded_by?: string | null
          santri_id?: string
          surat?: string | null
          tahun?: number
          tanggal?: string
          total_juz?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "setoran_hafalan_santri_id_fkey"
            columns: ["santri_id"]
            isOneToOne: false
            referencedRelation: "santri"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_musyrif: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "guru" | "wali_santri"
      attendance_status: "present" | "izin" | "sakit" | "dinas_luar" | "alfa"
      kelas_type: "Angkatan 1" | "Angkatan 2" | "Angkatan 3"
      waktu_halaqah: "subuh" | "maghrib"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
  | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
    DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
    DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
    DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
  | keyof DefaultSchema["Tables"]
  | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
  | keyof DefaultSchema["Enums"]
  | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof DefaultSchema["CompositeTypes"]
  | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
  ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "guru", "wali_santri"],
      attendance_status: ["present", "izin", "sakit", "dinas_luar", "alfa"],
      kelas_type: ["Angkatan 1", "Angkatan 2", "Angkatan 3"],
      waktu_halaqah: ["subuh", "maghrib"],
    },
  },
} as const
