import React from "react";
import { Outlet } from "react-router-dom";
import { FloatingDialog } from "../prompt/common/CommonStyles";

const DialogLayout: React.FC = () => {
  return (
    <FloatingDialog p={10}>
      <Outlet />
    </FloatingDialog>
  );
};

export default DialogLayout;
