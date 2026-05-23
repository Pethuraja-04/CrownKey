// Fixed, behind-everything ambient layer. Three soft blurred blobs in the
// brand palette + a global grain overlay. Pure CSS — no image assets,
// no animations that thrash the GPU.

export default function BackgroundDecor() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-grain"
    >
      {/* Warm gold halo, top-right */}
      <div
        className="absolute -top-40 -right-32 h-[42rem] w-[42rem] rounded-full opacity-50 animate-blob-1"
        style={{
          background:
            'radial-gradient(closest-side, rgba(212,164,90,0.32), rgba(212,164,90,0) 70%)',
        }}
      />
      {/* Deep ink halo, bottom-left */}
      <div
        className="absolute -bottom-48 -left-40 h-[44rem] w-[44rem] rounded-full opacity-60 animate-blob-2"
        style={{
          background:
            'radial-gradient(closest-side, rgba(11,18,32,0.20), rgba(11,18,32,0) 70%)',
        }}
      />
      {/* Soft warm wash, mid-right */}
      <div
        className="absolute top-1/3 left-1/2 h-[34rem] w-[34rem] rounded-full opacity-40 animate-blob-3"
        style={{
          background:
            'radial-gradient(closest-side, rgba(246,236,213,0.6), rgba(246,236,213,0) 70%)',
        }}
      />
    </div>
  );
}
