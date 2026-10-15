import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { usePlatformFramework, usePublishFramework, useSaveFrameworkDraft } from '@/hooks/use-platform-admin';
import { usePermission, PERMISSIONS } from '@/hooks/use-permission';
import { Box, Footer, ListItem, LoadError, Loading, PageHead, Pill } from '../components/pulse-ui';
import { errorMessage, formatDateTime } from '../components/pulse-format';

/** PA-02 · Khung chuẩn (mock `#/admin/framework`): six domains edited as a draft, published as a numbered version. */
export function PlatformFrameworkPage() {
  const { data, isLoading, error } = usePlatformFramework();
  const save = useSaveFrameworkDraft();
  const publish = usePublishFramework();
  const { can } = usePermission();
  const canManage = can(PERMISSIONS.PLATFORM_CATALOG_MANAGE);
  const [drafts, setDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (data) setDrafts(Object.fromEntries(data.domains.map((d) => [d.code, d.draftDescription])));
  }, [data]);

  const head = (
    <PageHead
      eyebrow="Nền tảng / Khung chuẩn"
      title="Một chuẩn đã công bố cho mọi doanh nghiệp."
      description="Chỉnh sửa mô tả bản nháp và công bố phiên bản mới. Trần doanh nghiệp, phòng ban và vị trí không vượt chuẩn Digital AI."
      actions={
        data && (
          <>
            <Pill>Đã công bố v{data.currentVersion}.0</Pill>
            {data.hasDraft && <Pill tone="coral">Có bản nháp</Pill>}
          </>
        )
      }
    />
  );

  if (isLoading || error || !data) {
    return (
      <>
        {head}
        {isLoading ? <Loading /> : <LoadError error={error} />}
      </>
    );
  }

  const dirty = data.domains.some((d) => (drafts[d.code] ?? d.draftDescription) !== d.draftDescription);
  const tooShort = data.domains.some((d) => (drafts[d.code] ?? '').trim().length < 15);

  const onSave = (e: FormEvent) => {
    e.preventDefault();
    save.mutate(
      data.domains.map((d) => ({ code: d.code, description: drafts[d.code] ?? d.draftDescription })),
      {
        onSuccess: () => toast.success('Đã lưu bản nháp khung chuẩn', { description: 'Phiên bản đã công bố chưa thay đổi.' }),
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  const onPublish = () =>
    publish.mutate(undefined, {
      onSuccess: (result) => toast.success(`Đã công bố khung chuẩn v${result.currentVersion}.0`),
      onError: (err) => toast.error(errorMessage(err)),
    });

  return (
    <>
      {head}
      <Box>
        <form onSubmit={onSave}>
          <div className="sideflow-domain-editor">
            {data.domains.map((d, i) => (
              <label key={d.code} className="field">
                <b>
                  0{i + 1} · {d.name}
                </b>
                <textarea
                  value={drafts[d.code] ?? ''}
                  onChange={(e) => setDrafts((prev) => ({ ...prev, [d.code]: e.target.value }))}
                  minLength={15}
                  maxLength={4000}
                  required
                  disabled={!canManage}
                />
                <small>
                  Mức: Cơ bản · Trung cấp · Nâng cao. Trần Digital AI: L3.{d.hasDraft ? ' Bản nháp khác bản đã công bố.' : ''}
                </small>
              </label>
            ))}
          </div>
          {canManage && (
            <div className="button-row">
              <button className="btn btn-outline" type="submit" disabled={!dirty || tooShort || save.isPending}>
                {save.isPending ? 'Đang lưu…' : 'Lưu bản nháp'}
              </button>
              <button className="btn btn-primary" type="button" disabled={!data.hasDraft || dirty || publish.isPending} onClick={onPublish}>
                {publish.isPending ? 'Đang công bố…' : 'Công bố phiên bản tiếp theo →'}
              </button>
              {dirty && <span className="field-hint">Lưu bản nháp trước khi công bố.</span>}
            </div>
          )}
        </form>
      </Box>
      <Box>
        <span className="mini-label">Mẫu vị trí tham khảo</span>
        <h2 className="panel-title">Doanh nghiệp tùy chỉnh theo chuẩn.</h2>
        <p className="panel-desc">
          Chủ doanh nghiệp chỉ xem được lĩnh vực và mức đã công bố; doanh nghiệp đặt trần riêng, rồi thu hẹp mục tiêu theo phòng ban và vị trí.
        </p>
        <Link className="btn btn-outline btn-small" to="/platform/curriculum">
          Xem 18 khóa học chuẩn
        </Link>
      </Box>
      <Box>
        <span className="mini-label">Lịch sử công bố</span>
        {data.releases.map((r) => (
          <ListItem
            key={r.versionNo}
            title={`v${r.versionNo}.0`}
            detail={[formatDateTime(r.publishedAt), r.publishedByEmail ?? 'Hệ thống', r.releaseNote].filter(Boolean).join(' · ')}
          />
        ))}
      </Box>
      <Footer />
    </>
  );
}
