type PhoneInputProps = {
  phone: string;
  error: string;
  onChange: (value: string) => void;
};

export function PhoneInput({
  phone,
  error,
  onChange,
}: PhoneInputProps) {
  const digitLength = phone.replace(/\D/g, "").length;

  return (
    <div
      className={`bg-white/[0.02] rounded-2xl border overflow-hidden mb-4 transition-colors ${
        error ? "border-red-500/40" : "border-white/[0.06]"
      }`}
    >
      <div className="px-5 py-4 flex items-start gap-3">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-base transition-colors ${
            error ? "bg-red-500/10" : "bg-white/5"
          }`}
        >
          📞
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40">
              เบอร์โทรศัพท์ <span className="text-red-400">*</span>
            </p>

            {digitLength > 0 && (
              <span
                className={`text-[10px] font-medium ${
                  digitLength === 10 ? "text-green-400" : "text-white/30"
                }`}
              >
                {digitLength}/10
              </span>
            )}
          </div>

          <input
            type="tel"
            inputMode="tel"
            placeholder="เบอร์โทร"
            value={phone}
            onChange={(event) =>
              onChange(event.target.value.replace(/[^0-9-]/g, ""))
            }
            maxLength={13}
            className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:ring-2 transition-all ${
              error
                ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/10"
                : "border-white/10 focus:border-green-500/50 focus:ring-green-500/10"
            }`}
          />

          {error ? (
            <p className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
              <span>⚠️</span> {error}
            </p>
          ) : (
            <p className="text-[11px] text-white/30 mt-1.5">
              กรอกเบอร์โทรเพื่อให้สนามติดต่อกลับได้
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
