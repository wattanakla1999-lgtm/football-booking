export default function BookingCardsSkeleton() {
    return (
        <section className="grid min-w-0 grid-cols-1 gap-3 md:grid-cols-2">
            {Array.from({ length: 6 }).map((_, index: number) => (
                <div
                    key={index}
                    className="glass-card animate-pulse overflow-hidden rounded-xl"
                >
                    <div className="flex items-center justify-between border-b border-outline-variant/10 p-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-lg bg-surface-container-high" />

                            <div>
                                <div className="h-2.5 w-16 rounded bg-surface-container-high" />
                                <div className="mt-1.5 h-3.5 w-24 rounded bg-surface-container-high" />
                            </div>
                        </div>

                        <div className="h-6 w-16 rounded-full bg-surface-container-high" />
                    </div>

                    <div className="space-y-3 p-3.5">
                        <div className="flex items-center gap-2.5">
                            <div className="h-10 w-10 rounded-full bg-surface-container-high" />

                            <div>
                                <div className="h-3.5 w-28 rounded bg-surface-container-high" />
                                <div className="mt-1.5 h-2.5 w-20 rounded bg-surface-container-high" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {Array.from({ length: 4 }).map(
                                (_, itemIndex) => (
                                    <div
                                        key={itemIndex}
                                        className="h-14 rounded-lg bg-surface-container-high"
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </section>
    );
}
