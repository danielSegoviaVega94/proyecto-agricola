type RatingStarsProps = {
  value: number;
};

export function RatingStars({ value }: RatingStarsProps) {
  const roundedValue = Math.max(0, Math.min(5, Math.round(value)));

  return (
    <div aria-label={`${roundedValue} de 5 estrellas`} className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, index) => {
        const filled = index < roundedValue;

        return (
          <span
            key={`star-${index + 1}`}
            data-filled={filled}
            className={filled ? "text-[#f59e0b]" : "text-[#d4d4d4]"}
          >
            {filled ? "★" : "☆"}
          </span>
        );
      })}
    </div>
  );
}
