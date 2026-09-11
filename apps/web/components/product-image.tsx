import Image from 'next/image';

type ProductImageProps = {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
};

export function ProductImage({
  src,
  alt,
  priority = false,
  className,
}: ProductImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
      priority={priority}
      unoptimized
      className={className ?? 'object-cover'}
    />
  );
}
