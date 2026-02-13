import { Button } from '../../catalyst/button';
import { Dialog, DialogActions, DialogBody, DialogDescription, DialogTitle } from '../../catalyst/dialog';

export default function ModalDialog({ open, title, children, footer, onClose }) {
  if (!open) return null;

  return (
    <Dialog open={open} onClose={onClose} size="md">
      <DialogTitle>{title}</DialogTitle>
      <DialogBody>
        <DialogDescription>{children}</DialogDescription>
      </DialogBody>
      <DialogActions>
        {footer || (
          <Button color="white" onClick={onClose}>
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
