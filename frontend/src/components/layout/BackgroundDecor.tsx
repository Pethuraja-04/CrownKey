// Fixed, behind-everything ambient layer. Three soft blurred blobs in the
// brand palette + a global grain overlay. Pure CSS — no image assets,
// no animations that thrash the GPU.

export default function BackgroundDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-grain"
    >
      {/* Neutral zinc halo, top-right */}
      <div
        className="absolute -top-40 -right-32 h-[42rem] w-[42rem] rounded-full opacity-50 animate-blob-1"
        style={{
          background:
            'radial-gradient(closest-side, rgba(161,161,170,0.15), rgba(161,161,170,0) 70%)',
        }}
      />
      {/* Deep zinc halo, bottom-left */}
      <div
        className="absolute -bottom-48 -left-40 h-[44rem] w-[44rem] rounded-full opacity-60 animate-blob-2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(24,24,27,0.08), rgba(24,24,27,0) 70%)',
        }}
      />
      {/* Soft light zinc wash, mid-right */}
      <div
        className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] rounded-full opacity-40 animate-blob-3"
        style={{
          background:
            'radial-gradient(closest-side, rgba(212,212,216,0.12), rgba(212,212,216,0) 70%)',
        }}
      />
    </div>
  );
}
