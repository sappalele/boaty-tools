import { keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import { FC, PropsWithChildren } from "react";

const kf = keyframes`
    0% {
        height: 10px;
        width: 10px;
    }
    50% {
        height: 20px;
        width: 20px;
    }
    100% {
        height: 10px;
        width: 10px;
    }
`;

const Ball = styled.div`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: ${kf} 1s ease-in-out infinite;
`;

const GrowyBall: FC<PropsWithChildren> = ({ children }) => {
  return <Ball>{children}</Ball>;
};

export default GrowyBall;
