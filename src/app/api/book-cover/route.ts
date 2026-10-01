export async function GET(request: Request) {
  return Response.redirect(
    new URL("/images/clinical-myofascial-therapy-cover.svg", request.url),
    308,
  );
}
