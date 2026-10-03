export const Toast = ({ message }: { message: string }) => message ? <div className="toast">{message}</div> : null;
