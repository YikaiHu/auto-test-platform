import React, { useEffect, useState } from "react";
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
import { AllowedParameters } from "API";

interface TriggerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onTrigger: (buffer: string, logType: string) => void;
  parameters: AllowedParameters[];
}

const TriggerDialog: React.FC<TriggerDialogProps> = ({
  isOpen,
  onClose,
  onTrigger,
  parameters,
}) => {
  const [selections, setSelections] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // 初始化选择对象，键是parameterName，值是空字符串
    const initialSelections: { [key: string]: string } = {};
    parameters.forEach((param) => {
      initialSelections[param.parameterKey!] = "";
    });
    setSelections(initialSelections);
  }, [parameters]);

  const paperStyle = {
    minWidth: "500px",
  };

  const isTriggerEnabled = Object.values(selections).every(
    (value) => value !== ""
  );

  const handleChange = (parameterKey: string, value: string) => {
    setSelections((prev) => ({ ...prev, [parameterKey]: value }));
  };

  return (
    <Dialog open={isOpen} onClose={onClose} PaperProps={{ style: paperStyle }}>
      <DialogTitle>Test Configurations</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {parameters.map((param) => (
            <Grid item xs={6} key={param.parameterKey}>
              <FormControl fullWidth margin="normal">
                <InputLabel id={`${param.parameterKey}-select-label`}>
                  {param.parameterKey}
                </InputLabel>
                <Select
                  labelId={`${param.parameterKey}-select-label`}
                  value={selections[param.parameterKey ?? ""]}
                  onChange={(e) =>
                    handleChange(param.parameterKey ?? "", e.target.value as string)
                  }
                >
                  {param.allowedValues!.map((value) => (
                    <MenuItem value={value ?? ""} key={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          btnType="primary"
          disabled={!isTriggerEnabled}
          onClick={() => onTrigger(selections["buffer"], selections["logType"])}
        >
          Trigger
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TriggerDialog;
