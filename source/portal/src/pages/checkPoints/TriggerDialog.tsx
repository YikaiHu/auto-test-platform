import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "components/Button";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Grid from "@material-ui/core/Grid";

interface TriggerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTrigger: (buffer: string, logType: string) => void;
}

const TriggerDialog: React.FC<TriggerDialogProps> = ({
  isOpen,
  onClose,
  onTrigger,
}) => {
  const [bufferSelection, setBufferSelection] = useState("");
  const [logTypeSelection, setLogTypeSelection] = useState("");

  const paperStyle = {
    minWidth: "500px", 
  };
  const isTriggerEnabled = bufferSelection && logTypeSelection;

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ style: paperStyle }}>
      <DialogTitle>Test Configurations</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="buffer-select-label">Buffer Type</InputLabel>
              <Select
                labelId="buffer-select-label"
                value={bufferSelection}
                onChange={(e) => setBufferSelection(e.target.value as string)}
              >
                <MenuItem value="KDS">KDS</MenuItem>
                <MenuItem value="S3">S3</MenuItem>
                <MenuItem value="None">None Buffer</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel id="log-type-select-label">Log Type</InputLabel>
              <Select
                labelId="log-type-select-label"
                value={logTypeSelection}
                onChange={(e) => setLogTypeSelection(e.target.value as string)}
              >
                <MenuItem value="JSON">JSON</MenuItem>
                <MenuItem value="Apache">Apache</MenuItem>
                <MenuItem value="Nginx">Nginx</MenuItem>
                <MenuItem value="SingleText">SingleText</MenuItem>
                <MenuItem value="SpringBoot">SpringBoot</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          btnType="primary"
          disabled={!isTriggerEnabled}
          onClick={() => onTrigger(bufferSelection, logTypeSelection)}
        >
          Trigger
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TriggerDialog;
