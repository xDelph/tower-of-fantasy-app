export default async function (time: number): Promise<void> {
  return new Promise((resolve: () => void) => setTimeout(resolve, time));
}
