/* eslint-disable @typescript-eslint/no-explicit-any */
export const modifyPayload = (values: any) => {
  const data = JSON.stringify(values);

  return data;
};
