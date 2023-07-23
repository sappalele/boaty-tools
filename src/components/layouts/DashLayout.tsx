import { useAtom } from "jotai";
import React from "react";
import { Outlet } from "react-router-dom";
import { signInAtom } from "../../jotai";
import { FloatingDialog } from "../prompt/common/CommonStyles";
import GrowyBall from "../prompt/common/GrowyBall";

const DialogLayout: React.FC = () => {
  const [signIn] = useAtom(signInAtom);

  if (signIn.loading)
    return (
      <FloatingDialog p={10}>
        <GrowyBall />
      </FloatingDialog>
    );

  return (
    <>
      <Outlet />
    </>
  );
};

export default DialogLayout;
