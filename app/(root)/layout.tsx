import Image from "next/image";
import Link from "next/link";
import {ReactNode} from "react";

const RootLayout = ({children} :{children: ReactNode} ) => {
  return (
    <div className="root-layout">
    {children}
    </div>
  );
};

export default RootLayout;

