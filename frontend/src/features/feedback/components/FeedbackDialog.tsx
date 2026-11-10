import { translateUi, useUiLanguage } from '@/lib/i18n';
import { useCallback, useRef, useState } from 'react';
import { Bug, ImagePlus, MessageSquare, Star, X } from 'lucide-react';
import '../feedback.css';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { feedbackService, type CreateFeedbackInput } from '@/services/feedback.service';

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
// Same limits as CreateFeedbackValidator and the user_feedbacks CHECK constraints.
const MIN_TITLE = 5;
const MIN_DESCRIPTION = 10;

function TooShort({ value, min, what }: { value: string; min: number; what: string }) {
  useUiLanguage();
  const length = value.trim().length;
  if (length === 0 || length >= min) return null;
  return <p className="mt-1.5 text-xs text-ent-bad">{what} cần ít nhất {min} ký tự (còn thiếu {min - length}).</p>;
}

const COPY = {
  BUG: {
    heading: 'Báo lỗi mới',
    intro: 'Mô tả lỗi càng cụ thể, đội kỹ thuật càng sửa nhanh.',
    icon: Bug,
    titlePlaceholder: 'Ví dụ: Không nộp được bài kiểm tra',
    descriptionPlaceholder: 'Bạn đang làm gì? Bạn mong đợi điều gì? Thực tế đã xảy ra gì?',
    sent: 'Đã gửi báo lỗi. Đội kỹ thuật sẽ phản hồi tại trang Báo lỗi.',
    failed: 'Gửi báo lỗi thất bại. Vui lòng thử lại.',
  },
  FEEDBACK: {
    heading: 'Gửi góp ý',
    intro: 'Ý kiến của bạn giúp chúng tôi cải thiện sản phẩm.',
    icon: MessageSquare,
    titlePlaceholder: 'Ví dụ: Nên có chế độ tối cho trang học',
    descriptionPlaceholder: 'Chia sẻ chi tiết ý kiến của bạn...',
    sent: 'Cảm ơn bạn đã góp ý!',
    failed: 'Gửi góp ý thất bại. Vui lòng thử lại.',
  },
} as const;

interface Props {
  type: 'BUG' | 'FEEDBACK';
  onClose: () => void;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const ratio = Math.min(maxDim / width, maxDim / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  useUiLanguage();
  const [hover, setHover] = useState(0);
  const labels = ['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Rất tốt'];
  return (
    <div className="flex items-center gap-3">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => onChange(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hover || value)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-ent-line'
              }`}
            />
          </button>
        ))}
      </div>
      {(hover || value) > 0 && (
        <span className="text-xs text-ent-fg-2">{labels[hover || value]}</span>
      )}
    </div>
  );
}

export function FeedbackDialog({ type, onClose }: Props) {
  useUiLanguage();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copy = COPY[type];
  const HeadingIcon = copy.icon;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [where, setWhere] = useState('');
  const [rating, setRating] = useState(0);
  const [screenshots, setScreenshots] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const mutation = useMutation({
    mutationFn: (data: CreateFeedbackInput) => feedbackService.create(data),
    onSuccess: () => {
      toast.success(copy.sent);
      queryClient.invalidateQueries({ queryKey: ['my-feedbacks'] });
      onClose();
    },
    onError: () => {
      toast.error(copy.failed);
    },
  });

  const addFiles = useCallback(async (files: FileList | File[]) => {
    const toProcess = Array.from(files).filter((f) => f.type.startsWith('image/') && f.size <= MAX_FILE_SIZE);
    if (toProcess.length === 0) { toast.error('Chỉ chấp nhận ảnh dưới 5MB.'); return; }
    const remaining = MAX_SCREENSHOTS - screenshots.length;
    if (remaining <= 0) { toast.error(`Tối đa ${MAX_SCREENSHOTS} ảnh.`); return; }
    setUploading(true);
    try {
      const results = await Promise.all(toProcess.slice(0, remaining).map(compressImage));
      setScreenshots((prev) => [...prev, ...results].slice(0, MAX_SCREENSHOTS));
    } catch { toast.error('Không thể xử lý ảnh.'); }
    setUploading(false);
  }, [screenshots.length]);

  const removeScreenshot = (index: number) => setScreenshots((prev) => prev.filter((_, i) => i !== index));

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const imageFiles = Array.from(e.clipboardData.items)
      .filter((item) => item.type.startsWith('image/'))
      .map((item) => item.getAsFile())
      .filter(Boolean) as File[];
    if (imageFiles.length > 0) { e.preventDefault(); addFiles(imageFiles); }
  }, [addFiles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      type,
      title,
      description,
      pageUrl: type === 'BUG' && where.trim() ? where.trim() : undefined,
      rating: type === 'FEEDBACK' && rating > 0 ? rating : undefined,
      screenshots: screenshots.length > 0 ? screenshots : undefined,
    });
  };

  const isValid = title.trim().length >= MIN_TITLE && description.trim().length >= MIN_DESCRIPTION;

  return (
    <div className="fb-scope fixed inset-0 z-[9995] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-ent-card border border-ent-line shadow-2xl mx-4"
        onClick={(e) => e.stopPropagation()}
        onPaste={handlePaste}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-6 py-4 border-b border-ent-line">
          <div className="flex items-start gap-3">
            <span className={`mt-0.5 rounded-lg p-1.5 ${type === 'BUG' ? 'bg-red-50 text-red-500' : 'bg-[var(--ent-accent-soft)] text-ent-accent'}`}>
              <HeadingIcon className="h-4 w-4" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-ent-fg">{translateUi(copy.heading)}</h2>
              <p className="mt-0.5 text-xs text-ent-fg-2">{copy.intro}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} aria-label={translateUi("Đóng")} className="rounded-lg p-1 text-ent-fg-2 hover:bg-ent-raised hover:text-ent-fg transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* Rating (only for FEEDBACK) */}
          {type === 'FEEDBACK' && (
            <div>
              <label className="block text-sm font-medium text-ent-fg mb-1.5">{translateUi("Đánh giá chung")}</label>
              <StarRating value={rating} onChange={setRating} />
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ent-fg mb-1.5">Tiêu đề <span className="text-ent-bad">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={translateUi(copy.titlePlaceholder)}
              maxLength={200}
              className="w-full rounded-xl border border-ent-line bg-ent-bg px-4 py-2.5 text-sm text-ent-fg placeholder:text-ent-fg-2/40 focus:border-ent-accent focus:ring-1 focus:ring-ent-accent/30 focus:outline-none transition-colors"
            />
            <TooShort value={title} min={MIN_TITLE} what="Tiêu đề" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ent-fg mb-1.5">Mô tả chi tiết <span className="text-ent-bad">*</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={translateUi(copy.descriptionPlaceholder)}
              maxLength={5000}
              rows={4}
              className="w-full rounded-xl border border-ent-line bg-ent-bg px-4 py-2.5 text-sm text-ent-fg placeholder:text-ent-fg-2/40 focus:border-ent-accent focus:ring-1 focus:ring-ent-accent/30 focus:outline-none resize-none transition-colors"
            />
            <TooShort value={description} min={MIN_DESCRIPTION} what="Mô tả" />
          </div>

          {/* Where the bug happened (only for BUG) */}
          {type === 'BUG' && (
            <div>
              <label className="block text-sm font-medium text-ent-fg mb-1.5">
                Gặp lỗi ở đâu? <span className="text-ent-fg-2 font-normal text-xs">(không bắt buộc)</span>
              </label>
              <input
                type="text"
                value={where}
                onChange={(e) => setWhere(e.target.value)}
                placeholder="Ví dụ: Trang Lộ trình, khi bấm Bắt đầu khóa An toàn thông tin"
                maxLength={500}
                className="w-full rounded-xl border border-ent-line bg-ent-bg px-4 py-2.5 text-sm text-ent-fg placeholder:text-ent-fg-2/40 focus:border-ent-accent focus:ring-1 focus:ring-ent-accent/30 focus:outline-none transition-colors"
              />
            </div>
          )}

          {/* Screenshots */}
          <div>
            <label className="block text-sm font-medium text-ent-fg mb-1.5">
              Ảnh chụp màn hình <span className="text-ent-fg-2 font-normal text-xs">(tối đa {MAX_SCREENSHOTS} ảnh)</span>
            </label>
            {screenshots.length > 0 && (
              <div className="flex gap-2 mb-2 flex-wrap">
                {screenshots.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt={translateUi(`Ảnh ${i + 1}`)} className="h-20 w-28 rounded-lg object-cover border border-ent-line" />
                    <button
                      type="button"
                      onClick={() => removeScreenshot(i)}
                      className="absolute -top-1.5 -right-1.5 rounded-full bg-ent-bad p-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity shadow"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {screenshots.length < MAX_SCREENSHOTS && (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-ent-line hover:border-ent-accent/50 hover:bg-ent-raised/50 px-4 py-4 cursor-pointer transition-colors"
              >
                {uploading ? (
                  <span className="text-sm text-ent-fg-2">Đang xử lý ảnh...</span>
                ) : (
                  <>
                    <ImagePlus className="h-5 w-5 text-ent-fg-2" />
                    <span className="text-sm text-ent-fg-2">Kéo thả, dán (Ctrl+V) hoặc bấm để chọn ảnh</span>
                  </>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => e.target.files && addFiles(e.target.files)} />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="rounded-xl border border-ent-line px-5 py-2.5 text-sm font-medium text-ent-fg-2 hover:bg-ent-raised transition-colors">{translateUi("Hủy")}</button>
            <button
              type="submit"
              disabled={!isValid || mutation.isPending || uploading}
              className="rounded-xl bg-ent-accent px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {mutation.isPending ? translateUi('Đang gửi...') : translateUi('Gửi')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
