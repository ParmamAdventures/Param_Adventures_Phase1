import React from "react";
import Spinner from "../Spinner";

export default function TableLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="text-muted-foreground flex flex-col items-center gap-3 p-12 text-center">
      <Spinner size={32} />
      <p className="animate-pulse tracking-wide italic">{message}</p>
    </div>
  );
}
