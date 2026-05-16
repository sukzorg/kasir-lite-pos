import Swal from "sweetalert2";

const shared = {
  confirmButtonColor: "#0f8f3d",
  cancelButtonColor: "#6b7280"
};

export function showSuccess(title: string, text?: string) {
  return Swal.fire({
    ...shared,
    icon: "success",
    title,
    text,
    timer: 1800,
    showConfirmButton: false
  });
}

export function showError(title: string, text?: string) {
  return Swal.fire({
    ...shared,
    icon: "error",
    title,
    text
  });
}

export async function confirmAction(title: string, text?: string) {
  const result = await Swal.fire({
    ...shared,
    icon: "warning",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: "Ya, lanjutkan",
    cancelButtonText: "Batal"
  });

  return result.isConfirmed;
}
