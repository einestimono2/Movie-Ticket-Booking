import Swal from 'sweetalert2';

// "success" | "error" | "warning" | "info" | "question"
export const NotificationCard = ({
  title,
  content,
  confirmText = 'OK',
  showCancelButton = false,
  cancelText = 'Cancel',
  denyText = 'Deny',
  onConfirm = undefined,
  onDeny = undefined,
  onAllAction = undefined,
  onOther = undefined,
  reverseButtons = true,
  type = 'error',
}) => {
  Swal.fire({
    reverseButtons: reverseButtons,
    icon: type,
    title: title,
    text: content,
    showCancelButton: showCancelButton,
    showDenyButton: onDeny !== undefined,
    showConfirmButton: onConfirm !== undefined,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    denyButtonText: denyText,
  }).then((result) => {
    if (onAllAction) {
      onAllAction.call();
    } else if (onConfirm && result.isConfirmed) {
      onConfirm.call();
    } else if (onDeny && result.isDenied) {
      onDeny.call();
    } else {
      onOther?.call();
    }
  });
};
