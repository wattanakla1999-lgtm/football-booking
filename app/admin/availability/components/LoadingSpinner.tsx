export default function LoadingSpinner({
    fullHeight = false,
}: {
    fullHeight?: boolean;
}) {
    return (
        <div
            className={
                fullHeight
                    ? "flex min-h-[60vh] items-center justify-center"
                    : "flex justify-center p-12"
            }
        >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        </div>
    );
}