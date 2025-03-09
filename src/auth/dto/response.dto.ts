export type ResponseDto<TResult> =
  | { hasError: false; message: string; result: TResult }
  | { hasError: true; message: string; error: string };
