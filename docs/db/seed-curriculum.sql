-- Auto-generated from Word curriculum files
-- Run: psql -h localhost -p 5433 -U digitalent_app -d digitalent -f seed-curriculum.sql
BEGIN;

DO $$
DECLARE
  v_org_id uuid;
  v_user_id uuid;
  v_c_m1_f uuid := '7e3007d4-a4fb-4b7a-a2a0-7c740a75270c';
  v_m_m1_f_01 uuid := 'b2a58adc-96df-400c-8604-73ce5ae1da38';
  v_m_m1_f_02 uuid := 'baec65f1-508b-44f5-b17f-ffd21605fe90';
  v_m_m1_f_03 uuid := '76d7a770-8f5f-4938-b1c8-53d2ee598726';
  v_c_m1_i uuid := 'a5598a67-b9cf-47a5-a009-6c21ed969bdf';
  v_m_m1_i_01 uuid := 'b47e5d74-2e91-43b1-92fd-ba6909e65b63';
  v_m_m1_i_02 uuid := 'cd558748-8a27-4180-8875-3175508a967c';
  v_m_m1_i_03 uuid := 'c1dd4f42-ca9c-4d42-a669-a555858c8438';
  v_c_m1_a uuid := '5960deda-0415-40df-899a-c16dce953b3d';
  v_m_m1_a_01 uuid := 'fe52f321-0c91-4a94-9973-0c170c553aad';
  v_m_m1_a_02 uuid := 'b4787158-5cc4-4784-8953-9f56ad7bc4c1';
  v_m_m1_a_03 uuid := '1b7f90d3-6f84-45a9-9eb5-3c8cc706d33d';
  v_c_m2_f uuid := '7e930d9b-3bfb-4af9-8c8a-69eddec21b2f';
  v_m_m2_f_01 uuid := '745c32eb-466f-4c02-8fde-c869116cd6d7';
  v_m_m2_f_02 uuid := 'd2da043f-2d24-46d6-8167-cd25e00c48ab';
  v_m_m2_f_03 uuid := 'c7330e4a-2e2b-40b8-a330-0ea5a333e970';
  v_m_m2_f_04 uuid := 'd0b8092c-d8bb-41f8-94b3-abbf42890fb1';
  v_m_m2_f_05 uuid := 'cc624f3e-3e4b-4252-a931-723be88e1477';
  v_m_m2_f_06 uuid := '071d1a80-e452-457b-b167-f831942d5c1f';
  v_c_m2_i uuid := 'd17e527d-b9d7-479a-91a9-35dd7a0f7ada';
  v_m_m2_i_01 uuid := 'e2844adf-0249-42b2-96e3-10f5b9a1a700';
  v_m_m2_i_02 uuid := '4da9f9ef-1069-44f3-8525-4f99704c1864';
  v_m_m2_i_03 uuid := 'ed299895-4ea5-48ce-a167-029aee5cf36d';
  v_m_m2_i_04 uuid := '0b930654-d967-4f58-8b35-32fb827c6d4b';
  v_m_m2_i_05 uuid := 'cd72520a-ecf5-48fe-915e-967136958514';
  v_m_m2_i_06 uuid := 'ac28ee16-9a1a-459c-b6ed-691ce792b582';
  v_c_m2_a uuid := '8e78c3f4-65ae-4d5a-9ae3-d5b39fe8897f';
  v_m_m2_a_01 uuid := 'b2a611a1-38f2-4fe8-90b3-d1945db0e58c';
  v_m_m2_a_02 uuid := 'a5d92d2c-93cf-474c-b768-f845b6dbb8de';
  v_m_m2_a_03 uuid := '222af729-1ea7-4f96-8fae-bed1b2793636';
  v_m_m2_a_04 uuid := '6488da8e-0040-456a-9853-7fd9df023806';
  v_m_m2_a_05 uuid := 'cae82ae7-ff46-43ed-bc1f-3f325d1c23da';
  v_m_m2_a_06 uuid := '5f35d41f-7bb6-4f14-9171-c34a89996357';
  v_c_m3_f uuid := 'beb1898c-7580-4eb0-8d43-312300b8f243';
  v_m_m3_f_01 uuid := 'd0397b81-aa7f-4399-8ab5-17a3ef610925';
  v_m_m3_f_02 uuid := 'd8f09954-8625-4897-b557-fcc15f138b20';
  v_m_m3_f_03 uuid := '3f8af513-df7e-4a85-9ee7-054b624cea8f';
  v_m_m3_f_04 uuid := '0fb91e89-7076-4408-b6f1-2c92d5a0905b';
  v_c_m3_i uuid := 'ebc9d63d-ae36-459e-a8eb-181cb1a8f255';
  v_m_m3_i_01 uuid := '6952a953-72b8-4280-b4ec-8ebc87731038';
  v_m_m3_i_02 uuid := '3cad678c-05a3-4b84-b0f7-2cf3f7616d41';
  v_m_m3_i_03 uuid := '8fb72a9e-4cd5-4d84-abde-c5320e720b00';
  v_m_m3_i_04 uuid := 'c2ee873b-08a1-4ae7-824c-587056020942';
  v_c_m3_a uuid := '0c100aab-0059-4883-a0cd-7bbc619ba3b7';
  v_m_m3_a_01 uuid := 'e194918f-54c1-4002-b48a-990cb2b8ed4c';
  v_m_m3_a_02 uuid := '7ec8c02e-f00f-4413-8849-886e49efca0b';
  v_m_m3_a_03 uuid := 'e22bbb00-51b7-47a1-a7ff-5e41285f8f49';
  v_m_m3_a_04 uuid := '89ac4c21-c95d-4720-82e6-c740b7e3b7fc';
  v_c_m4_f uuid := '9842ba9a-ac17-4b58-ad4d-8833e16bbe3b';
  v_m_m4_f_01 uuid := '53945331-6ace-4a8c-909a-38463452a2d5';
  v_m_m4_f_02 uuid := '01811e68-d4b4-407b-897d-836033d91634';
  v_m_m4_f_03 uuid := 'eb58e05b-49fe-4bfc-9e2f-37d8b71ef011';
  v_m_m4_f_04 uuid := '8a61196c-23ee-4303-952f-335853b2c317';
  v_c_m4_i uuid := '7beadb42-cfeb-4060-bdb4-0f55f1b707eb';
  v_m_m4_i_01 uuid := '674e9177-3c3d-428b-b46f-17cd3de99e2d';
  v_m_m4_i_02 uuid := 'a1f8e699-d0cf-463b-8914-f3e2d666f1a3';
  v_m_m4_i_03 uuid := '6ae08cfa-5f11-4bfa-bd7b-70269550461f';
  v_m_m4_i_04 uuid := '001e6c1e-6770-4514-8eb2-da707aaa4a15';
  v_c_m4_a uuid := '31525721-7d20-4cb0-9c6a-01adb1ea334a';
  v_m_m4_a_01 uuid := 'c0ae186b-6874-452f-887c-be082b71cdec';
  v_m_m4_a_02 uuid := 'ced22cfb-e435-49ea-8bfc-d16cf9e1dabf';
  v_m_m4_a_03 uuid := '731af3c2-dce9-43ce-8ec4-dbbebd009c2e';
  v_m_m4_a_04 uuid := '8f05a5f9-dd0d-4d4f-a618-70d68e6be555';
  v_c_m5_f uuid := 'ca529a4d-e7cb-4dc2-a898-02f5343d1f8e';
  v_m_m5_f_01 uuid := '0f90e99f-ec79-4f74-ac0a-1210c38bf593';
  v_m_m5_f_02 uuid := 'c92d278d-e0d7-4400-9133-f3c13b1ec16a';
  v_m_m5_f_03 uuid := '469bead0-9f4e-4861-88f6-53c46ef371c7';
  v_m_m5_f_04 uuid := 'cff4c976-3da9-4851-bced-41258df52cf0';
  v_c_m5_i uuid := 'b728a4c8-c7fb-4ea8-a1ec-f601f24b185f';
  v_m_m5_i_01 uuid := 'f0d38790-28c0-4709-928e-1fbf5f688f47';
  v_m_m5_i_02 uuid := 'c293294c-3756-4acb-aeee-476afbb0ac37';
  v_m_m5_i_03 uuid := '1e5b0afd-80d1-4404-a711-b97b74dae535';
  v_m_m5_i_04 uuid := '9ca5586a-9df6-4c97-b8c3-b48d1a6d13a0';
  v_c_m5_a uuid := '3f313b0d-fb5d-4cfe-8979-63df0398f37a';
  v_m_m5_a_01 uuid := '7b811da1-7dd2-4f43-88db-d92ff3b5a089';
  v_m_m5_a_02 uuid := '88aa7930-4390-430a-9982-b880667b28b3';
  v_m_m5_a_03 uuid := '8fa8ec28-9509-4521-b2b5-20f03e03492b';
  v_m_m5_a_04 uuid := 'c980156e-da50-456a-a53b-a2c4732e1775';
  v_c_m6_f uuid := '91318318-5e1c-4478-b694-beb798a343a1';
  v_m_m6_f_01 uuid := 'ebc0272f-c897-4c1a-8aef-00f917e699b3';
  v_m_m6_f_02 uuid := 'a47baea7-67fc-45ff-8261-a8c1ea281207';
  v_m_m6_f_03 uuid := '2613e7bf-0148-407b-adf2-b0ed56e7eec3';
  v_c_m6_i uuid := '9de5fc73-8bba-4fd4-8188-90147ee102e8';
  v_m_m6_i_01 uuid := '9f7b4d67-900f-468f-bde4-fd68cf1083eb';
  v_m_m6_i_02 uuid := 'b1d52815-a54a-44c5-99bf-be6debb49824';
  v_m_m6_i_03 uuid := '3bb190a6-6556-4195-b1c2-252c397e84e6';
  v_c_m6_a uuid := 'd5703a10-e5f1-42b3-9c25-1291c37289f9';
  v_m_m6_a_01 uuid := '855524d7-3506-458d-9c38-4e70cc8df83c';
  v_m_m6_a_02 uuid := '6e5b6747-d68c-4d5a-8f89-44b25d3ddd02';
  v_m_m6_a_03 uuid := '87e514d1-0a0b-40f0-a90d-b828cf84ef3e';
BEGIN
  SELECT id INTO v_org_id FROM organizations LIMIT 1;
  SELECT id INTO v_user_id FROM users WHERE email = 'owner@digitalent.ai';

  -- === COURSES ===
  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m1_f, v_org_id, 'M1-F', 1, 'TÌM KIẾM VÀ LƯU TRỮ THÔNG TIN CƠ BẢN', 'Mỗi ngày bạn đều tìm kiếm thông tin trên mạng — tìm giá, tìm quy định, tìm cách làm việc gì đó. Khóa học này giúp bạn làm ba việc tốt hơn: tìm đúng thứ cần tìm nhanh hơn, biết thông tin nào tin được, và giữ lại thông tin đó sao cho lần sau tìm lại được ngay.', 1, 360, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m1_i, v_org_id, 'M1-I', 1, 'CHIẾN LƯỢC TÌM KIẾM VÀ QUẢN LÝ THÔNG TIN', 'Ở khóa Cơ bản, bạn đã biết tìm và lưu thông tin. Nhưng khi công việc phức tạp hơn — cấp trên giao một đề tài mơ hồ, hai nguồn cho hai con số khác nhau, dữ liệu nhiều đến mức không nhớ nổi cái gì ở đâu — bạn cần nhiều hơn là biết gõ từ khóa. Khóa này dạy bạn thiết kế một chiến lược tìm kiếm, đánh giá nguồn tin bằng bộ tiêu chí thật sự, và tổ chức thông tin ở quy mô lớn hơn.', 2, 450, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m1_a, v_org_id, 'M1-A', 1, 'PHÂN TÍCH THÔNG TIN VÀ QUẢN TRỊ DỮ LIỆU', 'Ở khóa Trung cấp, bạn xử lý được vài nguồn mâu thuẫn cho một câu hỏi rõ ràng. Ở khóa này, câu hỏi thường không rõ ràng ngay từ đầu, dữ liệu đến từ nhiều hệ thống nội bộ lẫn bên ngoài, và không có sẵn bộ tiêu chí để áp dụng — bạn phải tự đặt ra tiêu chuẩn đó cho cả bộ phận. Đây là nội dung dành cho người sẽ ra quyết định dựa trên dữ liệu, và dẫn dắt người khác làm điều tương tự.', 3, 540, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m2_f, v_org_id, 'M2-F', 1, 'GIAO TIẾP SỐ CƠ BẢN NƠI CÔNG SỞ', 'Công việc ngày nay diễn ra qua email, tin nhắn, cuộc họp trực tuyến và tài liệu dùng chung nhiều hơn là gặp mặt trực tiếp. Khóa học này giúp bạn dùng đúng công cụ giao tiếp, chia sẻ thông tin an toàn, cư xử phù hợp trên môi trường số, và hiểu mình đang để lại dấu vết gì trên mạng.', 1, 720, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m2_i, v_org_id, 'M2-I', 1, 'GIAO TIẾP VÀ CỘNG TÁC CHUYÊN NGHIỆP', 'Ở khóa Cơ bản, bạn đã biết dùng đúng công cụ. Ở khóa này, bạn học cách chọn kênh cho từng tình huống, chia sẻ thông tin có kiểm soát theo mức độ nhạy cảm, điều phối công việc nhóm hiệu quả, và quản lý hình ảnh nghề nghiệp của mình một cách chủ động.', 2, 900, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m2_a, v_org_id, 'M2-A', 1, 'LÃNH ĐẠO GIAO TIẾP VÀ CỘNG TÁC SỐ', 'Ở khóa Trung cấp, bạn giao tiếp và cộng tác hiệu quả trong phạm vi công việc của mình. Ở khóa này, bạn thiết kế cách thức giao tiếp cho cả tổ chức, xử lý khủng hoảng, và dẫn dắt người khác trong môi trường làm việc số.', 3, 1080, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m3_f, v_org_id, 'M3-F', 1, 'TẠO LẬP NỘI DUNG SỐ CƠ BẢN', 'Khóa học này giúp bạn tạo được tài liệu công việc cơ bản, chỉnh sửa nội dung có sẵn, hiểu nguyên tắc bản quyền tối thiểu, và làm quen với tư duy sắp xếp công việc theo logic từng bước.', 1, 480, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m3_i, v_org_id, 'M3-I', 1, 'TẠO LẬP NỘI DUNG CHUYÊN NGHIỆP', 'Ở khóa Cơ bản, bạn tạo được tài liệu đơn giản. Ở khóa này, bạn học cách sản xuất nội dung đạt chuẩn chuyên nghiệp cho nhiều kênh, tái sử dụng nội dung hiệu quả, xử lý đúng vấn đề bản quyền phức tạp hơn, và tự động hóa công việc lặp lại.', 2, 600, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m3_a, v_org_id, 'M3-A', 1, 'CHIẾN LƯỢC NỘI DUNG VÀ GIẢI PHÁP SỐ', 'Ở khóa Trung cấp, bạn sản xuất được nội dung chuyên nghiệp cho từng nhiệm vụ cụ thể. Ở khóa này, bạn xây dựng chiến lược nội dung cho cả tổ chức, thiết kế hệ thống sản xuất có thể mở rộng, quản trị rủi ro pháp lý, và thiết kế giải pháp số cho vấn đề nghiệp vụ.', 3, 720, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m4_f, v_org_id, 'M4-F', 1, 'AN TOÀN SỐ CƠ BẢN', 'Khóa học này giúp bạn bảo vệ thiết bị và tài khoản của mình, nhận biết các mối đe dọa phổ biến, ý thức được thông tin cá nhân nào cần giữ kín, và hiểu tác động của thói quen số lên sức khỏe.', 1, 480, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m4_i, v_org_id, 'M4-I', 1, 'AN TOÀN THÔNG TIN TRONG CÔNG VIỆC', 'Ở khóa Cơ bản, bạn bảo vệ được thiết bị và tài khoản cá nhân. Ở khóa này, bạn áp dụng các biện pháp bảo mật trong công việc hàng ngày, xử lý dữ liệu cá nhân của khách hàng đúng nguyên tắc, và quản lý sức khỏe số cho bản thân và nhóm.', 2, 600, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m4_a, v_org_id, 'M4-A', 1, 'QUẢN TRỊ AN TOÀN VÀ TRÁCH NHIỆM SỐ', 'Ở khóa Trung cấp, bạn áp dụng đúng các biện pháp bảo mật và xử lý dữ liệu cá nhân trong công việc hàng ngày. Ở khóa này, bạn thiết kế hệ thống an toàn thông tin cho cả tổ chức, xây dựng chương trình tuân thủ bảo vệ dữ liệu cá nhân, và đưa yếu tố phúc lợi, bền vững vào chính sách doanh nghiệp.', 3, 720, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m5_f, v_org_id, 'M5-F', 1, 'XỬ LÝ SỰ CỐ VÀ TỰ HỌC CÔNG NGHỆ', 'Khóa học này giúp bạn tự xử lý được các sự cố kỹ thuật thường gặp, biết chọn công cụ phù hợp cho công việc đơn giản, và biết cách tự học khi gặp công nghệ mới.', 1, 480, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m5_i, v_org_id, 'M5-I', 1, 'GIẢI QUYẾT VẤN ĐỀ TRONG CÔNG VIỆC SỐ', 'Ở khóa Cơ bản, bạn tự xử lý được sự cố đơn giản. Ở khóa này, bạn chẩn đoán và xử lý vấn đề kỹ thuật phức tạp hơn, đánh giá và lựa chọn công cụ cho cả bộ phận, cải tiến quy trình làm việc, và hỗ trợ đồng nghiệp phát triển năng lực.', 2, 600, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m5_a, v_org_id, 'M5-A', 1, 'ĐỔI MỚI VÀ DẪN DẮT CHUYỂN ĐỔI SỐ', 'Ở khóa Trung cấp, bạn giải quyết vấn đề kỹ thuật và cải tiến quy trình ở phạm vi bộ phận. Ở khóa này, bạn dẫn dắt hoạt động chuyển đổi số ở cấp tổ chức: xây dựng năng lực hệ thống, lựa chọn và triển khai công nghệ, thúc đẩy đổi mới, và phát triển năng lực số cho toàn doanh nghiệp.', 3, 720, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m6_f, v_org_id, 'M6-F', 1, 'ỨNG DỤNG AI CƠ BẢN', 'Trí tuệ nhân tạo (AI) không còn là công nghệ xa lạ — bạn đã dùng nó mỗi khi gõ tìm kiếm và thấy gợi ý tự động, mỗi khi xem gợi ý video, hay khi trò chuyện với một trợ lý ảo. Khóa học này giúp bạn hiểu AI là gì ở mức căn bản, biết cách dùng một công cụ AI cho công việc đơn giản, và biết cách không tin tưởng mù quáng vào kết quả AI đưa ra.', 1, 360, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m6_i, v_org_id, 'M6-I', 1, 'ỨNG DỤNG AI TRUNG CẤP', 'Ở khóa Cơ bản, bạn đã biết dùng AI cho một việc đơn giản và biết kiểm tra chéo. Ở khóa này, bạn học cách chọn đúng công cụ AI cho từng loại việc, áp dụng AI có trách nhiệm trong một dự án thật của bộ phận, và đánh giá được khi nào kết quả AI đáng tin, khi nào cần thận trọng.', 2, 450, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  INSERT INTO courses (id, organization_id, code, version_no, title, description, entry_level, estimated_duration_minutes, certificate_enabled, status, created_by_user_id, created_at, updated_at, row_version)
  VALUES (v_c_m6_a, v_org_id, 'M6-A', 1, 'ỨNG DỤNG AI NÂNG CAO', 'Ở khóa Trung cấp, bạn áp dụng AI đúng cách cho công việc và dự án của bộ phận. Ở khóa này, bạn đánh giá cơ hội ứng dụng AI ở quy mô doanh nghiệp, xây quy tắc sử dụng AI có trách nhiệm cho tổ chức, và thiết lập tiêu chí lựa chọn công cụ AI một cách hệ thống.', 3, 540, true, 'PUBLISHED', v_user_id, now(), now(), 1);

  -- === COURSE MODULES ===
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_f_01, v_c_m1_f, 'M1-F-01', 'Tìm kiếm thông tin bằng từ khóa', 'Năng lực 1.1 · Mức 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_f_02, v_c_m1_f, 'M1-F-02', 'Nhận biết nguồn tin đáng tin cậy', 'Năng lực 1.2 · Mức 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_f_03, v_c_m1_f, 'M1-F-03', 'Lưu trữ và sắp xếp tài liệu', 'Năng lực 1.3 · Mức 1–2', 3, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_i_01, v_c_m1_i, 'M1-I-01', 'Chiến lược tìm kiếm và toán tử', 'Năng lực 1.1 · Mức 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_i_02, v_c_m1_i, 'M1-I-02', 'Đánh giá và so sánh nguồn tin', 'Năng lực 1.2 · Mức 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_i_03, v_c_m1_i, 'M1-I-03', 'Tổ chức và quản lý khối lượng thông tin lớn', 'Năng lực 1.3 · Mức 3–4', 3, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_a_01, v_c_m1_a, 'M1-A-01', 'Nghiên cứu phức hợp đa nguồn', 'Năng lực 1.1 · Mức 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_a_02, v_c_m1_a, 'M1-A-02', 'Đánh giá chất lượng dữ liệu', 'Năng lực 1.2 · Mức 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m1_a_03, v_c_m1_a, 'M1-A-03', 'Quản trị dữ liệu và vòng đời thông tin', 'Năng lực 1.3 · Mức 5–6', 3, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_01, v_c_m2_f, 'M2-F-01', 'Công cụ giao tiếp cơ bản', 'Năng lực 2.1 · Mức 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_02, v_c_m2_f, 'M2-F-02', 'Chia sẻ tài liệu và thông tin', 'Năng lực 2.2 · Mức 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_03, v_c_m2_f, 'M2-F-03', 'Dịch vụ công trực tuyến', 'Năng lực 2.3 · Mức 1–2', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_04, v_c_m2_f, 'M2-F-04', 'Làm việc nhóm trên công cụ số', 'Năng lực 2.4 · Mức 1–2', 4, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_05, v_c_m2_f, 'M2-F-05', 'Ứng xử trên môi trường số', 'Năng lực 2.5 · Mức 1–2', 5, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_f_06, v_c_m2_f, 'M2-F-06', 'Danh tính số cá nhân', 'Năng lực 2.6 · Mức 1–2', 6, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_01, v_c_m2_i, 'M2-I-01', 'Giao tiếp hiệu quả theo tình huống', 'Năng lực 2.1 · Mức 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_02, v_c_m2_i, 'M2-I-02', 'Chia sẻ thông tin có kiểm soát', 'Năng lực 2.2 · Mức 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_03, v_c_m2_i, 'M2-I-03', 'Tham gia dịch vụ công và nghĩa vụ số của doanh nghiệp', 'Năng lực 2.3 · Mức 3–4', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_04, v_c_m2_i, 'M2-I-04', 'Điều phối công việc nhóm', 'Năng lực 2.4 · Mức 3–4', 4, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_05, v_c_m2_i, 'M2-I-05', 'Chuẩn mực ứng xử và xử lý tình huống khó', 'Năng lực 2.5 · Mức 3–4', 5, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_i_06, v_c_m2_i, 'M2-I-06', 'Quản lý danh tính nghề nghiệp', 'Năng lực 2.6 · Mức 3–4', 6, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_01, v_c_m2_a, 'M2-A-01', 'Chiến lược giao tiếp tổ chức', 'Năng lực 2.1 · Mức 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_02, v_c_m2_a, 'M2-A-02', 'Quản trị luồng chia sẻ thông tin', 'Năng lực 2.2 · Mức 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_03, v_c_m2_a, 'M2-A-03', 'Doanh nghiệp trong môi trường số công cộng', 'Năng lực 2.3 · Mức 5–6', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_04, v_c_m2_a, 'M2-A-04', 'Dẫn dắt cộng tác nhóm phân tán', 'Năng lực 2.4 · Mức 5–6', 4, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_05, v_c_m2_a, 'M2-A-05', 'Văn hóa ứng xử số và xử lý khủng hoảng', 'Năng lực 2.5 · Mức 5–6', 5, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m2_a_06, v_c_m2_a, 'M2-A-06', 'Danh tính số của tổ chức', 'Năng lực 2.6 · Mức 5–6', 6, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_f_01, v_c_m3_f, 'M3-F-01', 'Tạo tài liệu công việc cơ bản', 'Năng lực 3.1 · Mức 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_f_02, v_c_m3_f, 'M3-F-02', 'Chỉnh sửa và tái sử dụng nội dung', 'Năng lực 3.2 · Mức 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_f_03, v_c_m3_f, 'M3-F-03', 'Nguyên tắc bản quyền cơ bản', 'Năng lực 3.3 · Mức 1–2', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_f_04, v_c_m3_f, 'M3-F-04', 'Làm quen tư duy tính toán', 'Năng lực 3.4 · Mức 1–2', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_i_01, v_c_m3_i, 'M3-I-01', 'Sản xuất nội dung đa định dạng', 'Năng lực 3.1 · Mức 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_i_02, v_c_m3_i, 'M3-I-02', 'Tích hợp và chuyển đổi nội dung', 'Năng lực 3.2 · Mức 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_i_03, v_c_m3_i, 'M3-I-03', 'Bản quyền, giấy phép và sử dụng hợp pháp', 'Năng lực 3.3 · Mức 3–4', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_i_04, v_c_m3_i, 'M3-I-04', 'Tự động hóa công việc lặp lại', 'Năng lực 3.4 · Mức 3–4', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_a_01, v_c_m3_a, 'M3-A-01', 'Chiến lược và hệ thống sản xuất nội dung', 'Năng lực 3.1 · Mức 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_a_02, v_c_m3_a, 'M3-A-02', 'Quản trị và tái sử dụng tài sản nội dung', 'Năng lực 3.2 · Mức 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_a_03, v_c_m3_a, 'M3-A-03', 'Quản trị rủi ro pháp lý về nội dung', 'Năng lực 3.3 · Mức 5–6', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m3_a_04, v_c_m3_a, 'M3-A-04', 'Thiết kế giải pháp số cho nghiệp vụ', 'Năng lực 3.4 · Mức 5–6', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_f_01, v_c_m4_f, 'M4-F-01', 'Bảo vệ thiết bị và tài khoản', 'Năng lực 4.1 · Mức 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_f_02, v_c_m4_f, 'M4-F-02', 'Bảo vệ thông tin cá nhân', 'Năng lực 4.2 · Mức 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_f_03, v_c_m4_f, 'M4-F-03', 'Sức khỏe khi làm việc với thiết bị số', 'Năng lực 4.3 · Mức 1–2', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_f_04, v_c_m4_f, 'M4-F-04', 'Sử dụng công nghệ có ý thức môi trường', 'Năng lực 4.4 · Mức 1–2', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_i_01, v_c_m4_i, 'M4-I-01', 'Bảo mật trong môi trường làm việc', 'Năng lực 4.1 · Mức 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_i_02, v_c_m4_i, 'M4-I-02', 'Xử lý dữ liệu cá nhân trong công việc', 'Năng lực 4.2 · Mức 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_i_03, v_c_m4_i, 'M4-I-03', 'Cân bằng số và sức khỏe nghề nghiệp', 'Năng lực 4.3 · Mức 3–4', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_i_04, v_c_m4_i, 'M4-I-04', 'Vận hành số bền vững', 'Năng lực 4.4 · Mức 3–4', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_a_01, v_c_m4_a, 'M4-A-01', 'Quản trị an toàn thông tin doanh nghiệp', 'Năng lực 4.1 · Mức 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_a_02, v_c_m4_a, 'M4-A-02', 'Tuân thủ bảo vệ dữ liệu cá nhân', 'Năng lực 4.2 · Mức 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_a_03, v_c_m4_a, 'M4-A-03', 'Chính sách phúc lợi số của tổ chức', 'Năng lực 4.3 · Mức 5–6', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m4_a_04, v_c_m4_a, 'M4-A-04', 'Chiến lược bền vững số', 'Năng lực 4.4 · Mức 5–6', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_f_01, v_c_m5_f, 'M5-F-01', 'Xử lý sự cố thường gặp', 'Năng lực 5.1 · Mức 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_f_02, v_c_m5_f, 'M5-F-02', 'Chọn công cụ phù hợp với công việc', 'Năng lực 5.2 · Mức 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_f_03, v_c_m5_f, 'M5-F-03', 'Cải tiến công việc bằng công cụ số', 'Năng lực 5.3 · Mức 1–2', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_f_04, v_c_m5_f, 'M5-F-04', 'Nhận biết và bù đắp khoảng trống năng lực', 'Năng lực 5.4 · Mức 1–2', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_i_01, v_c_m5_i, 'M5-I-01', 'Chẩn đoán và xử lý vấn đề kỹ thuật', 'Năng lực 5.1 · Mức 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_i_02, v_c_m5_i, 'M5-I-02', 'Đánh giá và lựa chọn giải pháp công nghệ', 'Năng lực 5.2 · Mức 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_i_03, v_c_m5_i, 'M5-I-03', 'Cải tiến quy trình bằng công cụ số', 'Năng lực 5.3 · Mức 3–4', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_i_04, v_c_m5_i, 'M5-I-04', 'Phát triển năng lực số cho bản thân và nhóm', 'Năng lực 5.4 · Mức 3–4', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_a_01, v_c_m5_a, 'M5-A-01', 'Xây dựng năng lực xử lý vấn đề của tổ chức', 'Năng lực 5.1 · Mức 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_a_02, v_c_m5_a, 'M5-A-02', 'Chiến lược công nghệ và triển khai thay đổi', 'Năng lực 5.2 · Mức 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_a_03, v_c_m5_a, 'M5-A-03', 'Đổi mới sáng tạo bằng công nghệ số', 'Năng lực 5.3 · Mức 5–6', 3, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m5_a_04, v_c_m5_a, 'M5-A-04', 'Phát triển năng lực số toàn tổ chức', 'Năng lực 5.4 · Mức 5–6', 4, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_f_01, v_c_m6_f, 'M6-F-01', 'Hiểu biết cơ bản về AI', 'Năng lực 6.1 · Bậc 1–2', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_f_02, v_c_m6_f, 'M6-F-02', 'Sử dụng công cụ AI cơ bản', 'Năng lực 6.2 · Bậc 1–2', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_f_03, v_c_m6_f, 'M6-F-03', 'Nhận biết cơ bản về đánh giá AI', 'Năng lực 6.3 · Bậc 1–2', 3, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_i_01, v_c_m6_i, 'M6-I-01', 'Hiểu biết AI ứng dụng vào công việc', 'Năng lực 6.1 · Bậc 3–4', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_i_02, v_c_m6_i, 'M6-I-02', 'Sử dụng AI có đạo đức và trách nhiệm trong công việc', 'Năng lực 6.2 · Bậc 3–4', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_i_03, v_c_m6_i, 'M6-I-03', 'Đánh giá công cụ AI trong công việc', 'Năng lực 6.3 · Bậc 3–4', 3, true, 'ACTIVE', now(), now());

  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_a_01, v_c_m6_a, 'M6-A-01', 'Đánh giá và định hướng ứng dụng AI', 'Năng lực 6.1 · Bậc 5–6', 1, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_a_02, v_c_m6_a, 'M6-A-02', 'Lãnh đạo ứng dụng AI có trách nhiệm', 'Năng lực 6.2 · Bậc 5–6', 2, true, 'ACTIVE', now(), now());
  INSERT INTO course_modules (id, course_id, code, title, description, sort_order, is_required, status, created_at, updated_at)
  VALUES (v_m_m6_a_03, v_c_m6_a, 'M6-A-03', 'Xây dựng năng lực đánh giá AI cho tổ chức', 'Năng lực 6.3 · Bậc 5–6', 3, true, 'ACTIVE', now(), now());

  -- === LESSONS ===
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a6379802-dd3f-4704-bedc-0c72f2146bd4', v_m_m1_f_01, 'M1-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được nhu cầu thông tin

- Tìm được dữ liệu, thông tin và nội dung thông qua tìm kiếm đơn giản trong môi trường số

- Tìm được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng

- Xác định được các chiến lược tìm kiếm đơn giản', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0d7706d1-0df4-4c6c-be9e-89475750f7a5', v_m_m1_f_01, 'M1-F-01-02', 'Định nghĩa', 'TEXT', '- Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến

- Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn

- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Công cụ tìm kiếm: dịch vụ khớp từ khóa người dùng nhập với chỉ mục các trang web đã thu thập sẵn, rồi xếp hạng kết quả theo mức độ liên quan

- Từ khóa: các từ mang ý nghĩa chính được dùng để tìm kiếm, thường là danh từ, số, hoặc tên riêng

- Kết quả tự nhiên (organic): kết quả được xếp hạng theo mức độ liên quan, không phải trả tiền

- Kết quả được tài trợ (sponsored): kết quả xuất hiện do đơn vị trả phí quảng cáo', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c7393be6-2be3-4fb4-853c-cf97f6c9510c', v_m_m1_f_01, 'M1-F-01-03', 'Nội dung', 'TEXT', 'Duyệt, tìm kiếm và lọc dữ liệu, thông tin và nội dung số nghĩa là xác định được nhu cầu thông tin và tìm kiếm được chúng trong môi trường số — không gian ảo nơi dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi qua Internet, phần mềm và nền tảng trực tuyến.

Công cụ tìm kiếm khớp từ khóa người dùng nhập với chỉ mục các trang đã thu thập sẵn, rồi xếp hạng theo mức độ liên quan — nó khớp CHỮ, không hiểu CÂU HỎI như con người. Vì vậy cần rút gọn câu hỏi thành 2–4 từ khóa mang nghĩa chính, thường là danh từ, số, hoặc tên riêng.

Điều hướng — quá trình định hướng và di chuyển trong không gian kỹ thuật số để tìm ra đường đi đến đích mong muốn — thể hiện qua việc đọc tiêu đề, đường dẫn, đoạn trích trên trang kết quả trước khi bấm vào. Kết quả tự nhiên khác với kết quả được tài trợ (quảng cáo trả phí). Khi lượt tìm đầu không ra kết quả phù hợp, cần biết cách đổi từ khóa — đây chính là chiến lược tìm kiếm đơn giản mà Thông tư 02/2025 yêu cầu người học xác định được ở bậc cơ bản.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6a0943cf-82f8-40a4-bcb2-31485ed019da', v_m_m1_f_01, 'M1-F-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cấp trên nhắn bạn: “Tìm giúp anh mức lương tối thiểu vùng hiện tại, khu vực mình đang ở.” Hãy thực hiện:

- Viết từ khóa sẽ dùng

- Thực hiện tìm kiếm thật

- Nếu không ra kết quả tốt trong lần đầu, ghi lại đã đổi từ khóa như thế nào

- Ghi lại đường dẫn của trang chính thức (cơ quan nhà nước) tìm được

- Giới hạn: tối đa 3 lượt tìm

Sản phẩm nộp: Nhật ký tìm kiếm (từ khóa dùng, số lần thử, lý do đổi nếu có) và đường dẫn nguồn chính thức tìm được.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('59e75686-6b2c-465e-b3aa-fec0ac432c1f', v_m_m1_f_01, 'M1-F-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Công cụ tìm kiếm hoạt động bằng cách nào? A. Quét toàn bộ Internet ngay lúc bạn gõ tìm kiếm B. Tìm trong mục lục đã được xây dựng từ trước C. Hỏi trực tiếp các trang web D. Chỉ tìm trong các trang đã được xác minh Đáp án: B — Công cụ tìm kiếm khớp từ khóa với chỉ mục đã thu thập trước đó, không quét trực tiếp Internet theo thời gian thực.

2. Từ khóa nào sau đây hiệu quả nhất để tìm quy định về nghỉ phép năm? A. Làm sao để xin nghỉ phép cho đúng B. quy định nghỉ phép năm người lao động C. nghỉ phép D. tôi muốn biết về nghỉ phép năm Đáp án: B — Đây là các danh từ và cụm từ chuyên ngành cụ thể, không có từ thừa.

3. Kết quả có nhãn “Được tài trợ” nghĩa là gì? A. Đây là kết quả chính xác nhất B. Trang này đã được kiểm chứng C. Đơn vị đó trả tiền để xuất hiện ở vị trí này D. Đây là kết quả mới nhất Đáp án: C — Quảng cáo trả phí không đồng nghĩa với độ tin cậy hay độ liên quan cao hơn.

4. Tìm kiếm “dịch vụ ăn uống” chỉ ra toàn nhà hàng, trong khi bạn cần số liệu ngành ăn uống. Bạn nên làm gì? A. Tìm lại y hệt vào ngày khác B. Thêm từ như “báo cáo”, “thống kê” vào từ khóa C. Thêm nhiều từ nhỏ như “và”, “của” D. Bỏ cuộc và hỏi đồng nghiệp Đáp án: B — Thêm từ chỉ loại tài liệu định hướng công cụ tìm kiếm sang nhóm nguồn khác.

5. Đường dẫn (URL) của một kết quả cho bạn biết điều gì? A. Trang đó có bao nhiêu lượt xem B. Ai là người/đơn vị đăng nội dung đó C. Trang đó có bao nhiêu quảng cáo D. Ngày trang được tạo Đáp án: B — URL chứa tên miền, cho biết đơn vị chịu trách nhiệm xuất bản trang.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c0f647fb-f9ce-479e-99d0-77114a780c54', v_m_m1_f_02, 'M1-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Phát hiện được độ tin cậy và độ chính xác của các nguồn chung của dữ liệu, thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a00deea3-ccc3-43db-8e3c-9ce5e918db9c', v_m_m1_f_02, 'M1-F-02-02', 'Định nghĩa', 'TEXT', '- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Tên miền (domain): phần địa chỉ chính của một trang web, cho biết ai là đơn vị đứng sau trang đó

- Đuôi tên miền: phần cuối của tên miền (.gov.vn, .com, .org…) thường gợi ý loại hình đơn vị sở hữu

- Ngày công bố: thời điểm nội dung được đăng tải hoặc cập nhật lần gần nhất', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f19c338a-61a0-41b8-907d-ac2ca37b9f28', v_m_m1_f_02, 'M1-F-02-03', 'Nội dung', 'TEXT', 'Đánh giá dữ liệu, thông tin và nội dung số nghĩa là phát hiện được độ tin cậy và độ chính xác của các nguồn chung. Thông tin là dữ liệu đã được tổ chức, xử lý để trở nên có ý nghĩa và dùng để ra quyết định — nhưng không phải thông tin nào tìm được cũng đáng tin.

Đường dẫn cho biết ai là đơn vị công bố. Đuôi tên miền như .gov.vn, .edu.vn, .org, .com mang ý nghĩa khác nhau về mức độ chính thức. Ngày công bố quan trọng vì thông tin có thể đã lỗi thời. Ba dấu hiệu cơ bản của tin không đáng tin: giật tít gây sốc, không có tác giả rõ ràng, không dẫn nguồn kiểm chứng được. Nhiều trang cùng nói một điều không có nghĩa là điều đó đúng — có thể tất cả cùng sao chép từ một nguồn sai.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a50653e6-619d-4fb9-bbd2-1e986051e5bb', v_m_m1_f_02, 'M1-F-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cho năm kết quả tìm kiếm về cùng một chủ đề (ví dụ quy mô thị trường bán lẻ Việt Nam), hãy xếp hạng theo độ tin cậy (1 là tin cậy nhất) và giải thích mỗi lựa chọn bằng một câu.

Sản phẩm nộp: Bảng xếp hạng 5 nguồn kèm lý do.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('81f57885-2d61-4718-88fb-dbd858426ed7', v_m_m1_f_02, 'M1-F-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Đuôi tên miền nào thường gắn với cơ quan nhà nước Việt Nam? A. .com B. .gov.vn C. .net D. .info Đáp án: B — .gov.vn được cấp riêng cho cơ quan nhà nước.

2. Một bài viết không ghi tên tác giả hay đơn vị xuất bản. Điều này có nghĩa gì? A. Bài viết chắc chắn sai B. Không ai chịu trách nhiệm nếu thông tin sai, nên cần thận trọng C. Bài viết được viết bởi chuyên gia ẩn danh D. Không quan trọng, miễn nội dung đúng Đáp án: B — Thiếu trách nhiệm giải trình là dấu hiệu cảnh báo, không phải bằng chứng bài viết sai, nhưng cần thận trọng hơn.

3. Với thông tin về mức giá hiện tại, yếu tố nào quan trọng nhất cần kiểm tra? A. Độ dài bài viết B. Ngày công bố C. Số lượt chia sẻ D. Màu sắc trang web Đáp án: B — Giá cả thay đổi theo thời gian; bài viết cũ có thể đã lỗi thời.

4. Tiêu đề “Sốc: Giá tăng gấp 10 lần chỉ sau một đêm!” là dấu hiệu của điều gì? A. Tin chính xác, cần hành động ngay B. Tiêu đề giật gân, cần kiểm tra kỹ nội dung trước khi tin C. Bài viết khoa học D. Nguồn chính phủ Đáp án: B — Ngôn ngữ cảm xúc mạnh thường nhằm câu view hơn là truyền tải chính xác.

5. .com có nghĩa là trang đó không đáng tin không? A. Đúng, luôn luôn không đáng tin B. Sai, .com chỉ có nghĩa là doanh nghiệp/cá nhân đăng ký, cần đánh giá thêm C. Đúng, chỉ .gov.vn mới đáng tin D. .com chỉ dùng cho trang nước ngoài Đáp án: B — Đuôi tên miền là một tín hiệu, không phải kết luận cuối cùng.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('90e9afff-2f22-438c-85b2-c9e4328b8ddc', v_m_m1_f_03, 'M1-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được cách tổ chức, lưu trữ và truy xuất dữ liệu, thông tin và nội dung một cách đơn giản trong môi trường số

- Nhận biết được nơi để sắp xếp chúng một cách đơn giản trong môi trường có cấu trúc', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2db83601-6cbb-48c1-a2cc-3cd2a68bc086', v_m_m1_f_03, 'M1-F-03-02', 'Định nghĩa', 'TEXT', '- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý

- Định dạng tệp: loại tệp được xác định bởi phần đuôi sau dấu chấm trong tên tệp (.pdf, .xlsx…), quyết định phần mềm nào mở được và có sửa được không

- Thư mục: nơi chứa và tổ chức các tệp theo một cấu trúc nhất định

- Quy tắc đặt tên: cách thống nhất đặt tên tệp để dễ tìm và sắp xếp đúng thứ tự', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f6a9f355-e8b2-4976-82fc-8366e4561b5d', v_m_m1_f_03, 'M1-F-03-03', 'Nội dung', 'TEXT', 'Quản lý dữ liệu, thông tin và nội dung số nghĩa là xác định được cách tổ chức, lưu trữ và truy xuất chúng một cách đơn giản, và nhận biết nơi sắp xếp trong môi trường có cấu trúc — không gian mà các thành phần dữ liệu được tổ chức theo quy tắc rõ ràng, giúp dễ tìm kiếm và xử lý.

Các định dạng phổ biến — văn bản, bảng tính, trình chiếu, PDF, ảnh — mỗi loại phù hợp một mục đích khác nhau. Nên tải tệp có chủ đích thay vì để mặc định. Quy tắc đặt tên nhất quán (ngày trước, không dấu, không ký tự đặc biệt) giúp dễ tìm lại. Thư mục cơ bản nên phân theo chủ đề hoặc dự án. Cần phân biệt giữa lưu (ghi đè bản cũ) và lưu thành bản mới (tạo phiên bản riêng) để tránh mất dữ liệu gốc.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2d78dd3f-9bcc-4053-b1a9-334c8b44061f', v_m_m1_f_03, 'M1-F-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tìm và tải ba tài liệu (PDF hoặc Excel) về một chủ đề công việc tự chọn. Tạo một thư mục mới đặt tên rõ ràng, đổi tên cả ba tệp theo công thức trên, và chụp ảnh màn hình thư mục hoàn chỉnh.

Sản phẩm nộp: Ảnh chụp thư mục chứa 3 tệp đặt tên đúng quy ước.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('25942408-ee9e-43ef-9103-c4bdff5889d8', v_m_m1_f_03, 'M1-F-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bạn nhận được số liệu cần chỉnh sửa. Bạn nên yêu cầu định dạng nào? A. .pdf B. .jpg C. .xlsx D. .pptx Đáp án: C — File Excel cho phép chỉnh sửa số liệu trực tiếp.

2. Mặc định, trình duyệt lưu file tải về ở đâu? A. Thư mục Documents B. Thư mục Downloads C. Màn hình chính D. Ngẫu nhiên Đáp án: B — Downloads là thư mục mặc định trừ khi được cấu hình khác.

3. Tên tệp nào đúng quy tắc nhất? A. bao-cao-final-v2-that.docx B. 2026-04-09_bao-cao-thang4.docx C. document1.docx D. BÁO CÁO MỚI!!.docx Đáp án: B — Bắt đầu bằng ngày theo định dạng năm-tháng-ngày, không dấu cách, không ký tự đặc biệt.

4. Vì sao nên đặt ngày ở đầu tên tệp theo định dạng năm-tháng-ngày? A. Để tên ngắn hơn B. Để khi sắp xếp theo tên, tệp tự xếp theo thứ tự thời gian C. Vì máy tính yêu cầu D. Không có lý do đặc biệt Đáp án: B — Định dạng năm-tháng-ngày sắp xếp đúng theo thời gian khi liệt kê theo bảng chữ cái.

5. File PDF phù hợp nhất cho mục đích nào? A. Tính toán số liệu B. Chia sẻ tài liệu giữ nguyên bố cục để in hoặc gửi C. Vẽ biểu đồ D. Soạn thảo cần chỉnh sửa nhiều Đáp án: B — PDF cố định bố cục, phù hợp chia sẻ/in nhưng khó chỉnh sửa.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6f95ab1b-bd71-4d9f-8d80-3bf186d13cb1', v_m_m1_i_01, 'M1-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Minh họa được nhu cầu thông tin

- Tổ chức được tìm kiếm dữ liệu, thông tin và nội dung trong môi trường số

- Mô tả được cách truy cập những dữ liệu, thông tin và nội dung này cũng như điều hướng giữa chúng

- Tổ chức được các chiến lược tìm kiếm', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('eb2c9529-36bb-4fc5-9293-c6864b652372', v_m_m1_i_01, 'M1-I-01-02', 'Định nghĩa', 'TEXT', '- Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến

- Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn

- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Nhu cầu thông tin: mô tả cụ thể về phạm vi, thời gian, mức chi tiết và sản phẩm đầu ra cần có trước khi bắt đầu tìm kiếm

- Ma trận từ khóa: bảng liệt kê từ khóa lõi cùng các từ đồng nghĩa, từ thu hẹp, từ mở rộng liên quan

- Toán tử tìm kiếm: ký hiệu đặc biệt (" ", site:, filetype:…) giúp thu hẹp hoặc mở rộng kết quả tìm kiếm theo ý muốn', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('275b4edb-10f2-4ed4-ab10-45085dd637b5', v_m_m1_i_01, 'M1-I-01-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc tổ chức tìm kiếm dữ liệu và mô tả cách truy cập, điều hướng đòi hỏi trước tiên minh họa rõ nhu cầu thông tin: phạm vi, thời gian, mức chi tiết, và sản phẩm đầu ra mong muốn trước khi bắt đầu tìm kiếm.

Ma trận từ khóa — bảng liệt kê từ khóa lõi cùng từ đồng nghĩa, từ thu hẹp, từ mở rộng — giúp tổ chức chiến lược tìm kiếm có hệ thống thay vì tìm ngẫu nhiên. Toán tử tìm kiếm (dấu ngoặc kép để khóa cụm từ, site: để giới hạn nguồn, filetype: để lọc định dạng, dấu trừ để loại trừ) giúp thu hẹp hoặc mở rộng kết quả theo ý muốn. Chọn công cụ tìm kiếm phù hợp với loại nguồn cần tìm, và biết quy tắc dừng tìm kiếm khi đã đủ thông tin cần thiết.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f9f0f6b8-9e0e-4928-ba24-2e030f9e81fe', v_m_m1_i_01, 'M1-I-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tìm văn bản quy định chính thức về một chủ đề (ví dụ an toàn thực phẩm, bảo vệ dữ liệu cá nhân), dạng PDF, ban hành trong ba năm gần nhất. Không được duyệt menu trang web — chỉ dùng toán tử. Ghi lại từng bước tinh chỉnh câu truy vấn (tối thiểu năm bước) và nộp đường dẫn văn bản gốc tìm được.

Sản phẩm nộp: Ma trận từ khóa, nhật ký tinh chỉnh truy vấn, đường dẫn văn bản gốc.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8ec416ef-f6a4-4ff5-a557-38175a7ea716', v_m_m1_i_01, 'M1-I-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. site:gov.vn "an toàn thực phẩm" filetype:pdf sẽ trả về kết quả nào? A. Tất cả trang nói về an toàn thực phẩm B. Chỉ file PDF trên các trang chính phủ có đúng cụm từ này C. Chỉ tin tức D. Không ra kết quả nào Đáp án: B — Ba toán tử kết hợp: giới hạn miền, cụm từ chính xác, định dạng file.

2. Để loại bỏ kết quả về tuyển sinh khi tìm về đào tạo nhân viên, dùng cú pháp nào? A. +tuyển sinh B. -tuyển-sinh C. "tuyển sinh" D. site:tuyensinh Đáp án: B — Dấu trừ loại trừ từ khỏi kết quả.

3. Vì sao cần xây nhiều vựng từ đồng nghĩa thay vì chỉ một bộ từ khóa? A. Để tìm nhanh hơn B. Vì các đơn vị khác nhau dùng từ ngữ khác nhau cho cùng khái niệm C. Vì công cụ yêu cầu D. Để tránh trùng lặp Đáp án: B — Từ vựng khác nhau chạm tới nhóm nguồn xuất bản khác nhau.

4. OR phải viết như thế nào để có tác dụng? A. Viết thường “or” B. Viết hoa “OR” C. Không quan trọng D. Phải có dấu ngoặc Đáp án: B — Google chỉ nhận diện toán tử OR khi viết hoa.

5. Trước khi tìm kiếm, bước đầu tiên nên làm là gì? A. Gõ ngay câu hỏi vào công cụ tìm kiếm B. Xác định rõ phạm vi, thời gian, mức chi tiết, sản phẩm cần có C. Mở nhiều tab cùng lúc D. Hỏi đồng nghiệp trước Đáp án: B — Định nghĩa nhu cầu rõ ràng trước khi tìm giúp tránh lãng phí thời gian.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8aa984c9-1f3e-47d9-8b6d-598a5ea4d7aa', v_m_m1_i_02, 'M1-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Thực hiện phân tích, so sánh và đánh giá được các nguồn dữ liệu, thông tin và nội dung số

- Thực hiện phân tích, diễn giải và đánh giá được dữ liệu, thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1b1924f4-e0a1-468a-a7d6-d2a0cfe919f2', v_m_m1_i_02, 'M1-I-02-02', 'Định nghĩa', 'TEXT', '- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Tiêu chí đánh giá nguồn tin: các yếu tố dùng để xét độ tin cậy của một nguồn — tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng

- Nguồn sơ cấp: nơi số liệu hoặc thông tin được tạo ra lần đầu tiên

- Nguồn thứ cấp: nơi trích dẫn hoặc tổng hợp lại từ nguồn sơ cấp

- Trích dẫn vòng: hiện tượng nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('4df83424-3b4d-4299-b522-2e0d4b079f86', v_m_m1_i_02, 'M1-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc thực hiện phân tích, so sánh và đánh giá độ tin cậy của nguồn dữ liệu đã được tổ chức rõ ràng đòi hỏi áp dụng năm tiêu chí: tác giả, thời điểm, mục đích, bằng chứng, khả năng kiểm chứng.

Cần phân biệt nguồn sơ cấp (nơi thông tin được tạo ra lần đầu) và nguồn thứ cấp (nơi trích dẫn hoặc tổng hợp lại). Hiện tượng trích dẫn vòng xảy ra khi nhiều nguồn cùng trích dẫn lẫn nhau nhưng thực chất bắt nguồn từ một nguồn gốc duy nhất chưa kiểm chứng. Khi các nguồn uy tín đưa ra số liệu khác nhau, thường do khác biệt về định nghĩa hoặc phương pháp đo lường — nên báo cáo khoảng giá trị thay vì một con số duy nhất khi các nguồn còn mâu thuẫn.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('be9bd611-83db-49bb-b012-201dc68ec63c', v_m_m1_i_02, 'M1-I-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cấp trên cần một con số cho slide, ví dụ “số lượng doanh nghiệp vừa và nhỏ tại Việt Nam.” Tìm ba nguồn khác nhau, lập bảng so sánh năm cột như trên, chỉ ra ít nhất một điểm khác biệt về định nghĩa hoặc phương pháp, và viết hai câu khuyến nghị nên dùng con số nào và vì sao.

Sản phẩm nộp: Bảng so sánh ba nguồn kèm đoạn giải trình lựa chọn.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1eabe38e-112e-4170-85dd-7a0849275df8', v_m_m1_i_02, 'M1-I-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Nguồn sơ cấp là gì? A. Nguồn được xuất bản đầu tiên trên Google B. Nơi số liệu được tạo ra ban đầu C. Trang có nhiều lượt xem nhất D. Trang chính phủ Đáp án: B — Sơ cấp là nơi gốc tạo ra dữ liệu, không phụ thuộc kênh xuất bản.

2. Năm trang web cùng trích “theo một nghiên cứu” nhưng đều dẫn về một bài blog gốc chưa kiểm chứng. Đây là hiện tượng gì? A. Bằng chứng đáng tin vì nhiều nguồn xác nhận B. Hiện tượng trích dẫn vòng — không phải xác nhận độc lập C. Dấu hiệu thông tin chính xác D. Không có vấn đề gì Đáp án: B — Năm nguồn nhưng chỉ một gốc; sự lặp lại không tạo thêm bằng chứng.

3. Hai nguồn uy tín đưa số liệu khác nhau về cùng một chỉ tiêu. Nguyên nhân phổ biến nhất là gì? A. Một trong hai chắc chắn sai B. Khác biệt về định nghĩa, kỳ báo cáo hoặc phương pháp đo C. Lỗi đánh máy D. Không có nguyên nhân hợp lý Đáp án: B — Khác biệt phương pháp luận là nguyên nhân phổ biến nhất, không phải sai sót.

4. Tiêu chí nào trong năm tiêu chí đánh giá kiểm tra xem trang có mục đích bán hàng hay không? A. Tác giả B. Mục đích C. Bằng chứng D. Khả năng kiểm chứng Đáp án: B — Tiêu chí “mục đích” hỏi trang tồn tại để làm gì.

5. Khi so sánh hai nguồn có số liệu khác nhau, bước đầu tiên nên làm là gì? A. Chọn số liệu cao hơn B. So sánh định nghĩa và phương pháp trước khi so sánh con số C. Lấy trung bình cộng D. Bỏ qua cả hai Đáp án: B — Hiểu đúng điều đang được đo trước khi kết luận về sự khác biệt.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5c6876ab-5005-4b7f-b088-4bdedb9e434f', v_m_m1_i_03, 'M1-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Sắp xếp được thông tin, dữ liệu, nội dung để dễ dàng lưu trữ và truy xuất

- Tổ chức được thông tin, dữ liệu và nội dung trong một môi trường có cấu trúc', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5d74507a-523e-4d53-9f4e-51523b3a775e', v_m_m1_i_03, 'M1-I-03-02', 'Định nghĩa', 'TEXT', '- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý

- Kiến trúc thông tin: cách tổ chức, phân nhóm và đặt tên tài liệu theo một logic nhất quán

- Sổ đăng ký tài liệu: bảng liệt kê thông tin về mọi tài liệu trong một dự án để dễ tìm và báo cáo

- Nguyên tắc quyền tối thiểu: chỉ cấp mức quyền truy cập thấp nhất đủ để hoàn thành công việc', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('821d0aa0-8a6a-4814-b2ae-94faaa2f0e56', v_m_m1_i_03, 'M1-I-03-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc sắp xếp thông tin để dễ lưu trữ và tổ chức trong môi trường có cấu trúc mở rộng sang quản lý khối lượng thông tin lớn cho cả một dự án nhiều luồng công việc.

Kiến trúc thông tin cần phân nhóm loại trừ lẫn nhau và giới hạn độ sâu thư mục để không quá phức tạp. Sổ đăng ký tài liệu ghi lại các trường bắt buộc (tên, chủ đề, phiên bản, người phụ trách) giúp tra cứu nhanh. Cần phân biệt lưu trữ cục bộ, đám mây, và thư mục dùng chung — đồng bộ không phải là sao lưu, vì thay đổi sai ở một nơi sẽ lan sang nơi khác. Nguyên tắc quyền tối thiểu áp dụng khi chia sẻ: chỉ cấp quyền cần thiết cho từng người.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9660343c-08fd-4624-b5ce-e5a0ab9e1d65', v_m_m1_i_03, 'M1-I-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cho một thư mục hỗn độn gồm nhiều loại tài liệu (hợp đồng, hóa đơn, ghi chú họp, báo cáo, hình ảnh). Thiết kế cấu trúc thư mục (tối đa bốn cấp), lập sổ đăng ký với tối thiểu 20 dòng, và viết quy tắc phân loại thành văn bản.

Sản phẩm nộp: Ảnh chụp thư mục đã tái cấu trúc, sổ đăng ký, và tệp quy ước.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5fc3bfcb-1316-4b20-927a-15cff6012702', v_m_m1_i_03, 'M1-I-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao nên giới hạn độ sâu thư mục ở khoảng bốn cấp? A. Do giới hạn kỹ thuật của máy tính B. Vượt quá mức đó người dùng thường không lưu đúng chỗ nữa C. Để tiết kiệm dung lượng D. Không có lý do cụ thể Đáp án: B — Cấu trúc quá sâu khiến việc lưu đúng chỗ trở nên khó khăn, dẫn đến sai lệch.

2. Sổ đăng ký tài liệu dùng để làm gì? A. Thay thế thư mục B. Giúp tìm và báo cáo theo thuộc tính tài liệu C. Chỉ để trang trí D. Không cần thiết nếu đã có thư mục Đáp án: B — Sổ đăng ký cho phép lọc/tìm theo thuộc tính, việc thư mục đơn thuần không làm được.

3. Nguyên tắc quyền tối thiểu nghĩa là gì? A. Cấp quyền cao nhất cho tất cả để tiện lợi B. Cấp mức quyền thấp nhất đủ để hoàn thành công việc C. Không cấp quyền cho ai D. Chỉ quản lý mới có quyền Đáp án: B — Bắt đầu từ mức thấp nhất, chỉ nâng khi thực sự cần.

4. Tài liệu nhạy cảm nên được chia sẻ bằng cách nào? A. Bất kỳ ai có liên kết, quyền chỉnh sửa B. Chia sẻ với người cụ thể theo tên, quyền hạn chế C. Đăng công khai để minh bạch D. Gửi qua email cho toàn công ty Đáp án: B — Chia sẻ theo tên người cụ thể với quyền tối thiểu giảm rủi ro rò rỉ.

5. Trộn hai cách phân loại (theo dự án và theo loại tài liệu) ở cùng một cấp thư mục gây ra vấn đề gì? A. Không có vấn đề gì B. Gây khó khăn khi quyết định lưu tệp vào đâu C. Tăng tốc độ tìm kiếm D. Giảm dung lượng lưu trữ Đáp án: B — Hai tiêu chí phân loại cạnh tranh nhau tạo ra sự mơ hồ khi lưu trữ.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ea3cb5ba-9538-4611-bb2b-f57a5a6e856b', v_m_m1_a_01, 'M1-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá được nhu cầu thông tin

- Điều chỉnh được chiến lược tìm kiếm để tìm ra dữ liệu, thông tin và nội dung phù hợp nhất trong môi trường số

- Giải thích được cách truy cập những dữ liệu, thông tin và nội dung thích hợp nhất và điều hướng giữa chúng

- Sử dụng linh hoạt và đa dạng chiến lược tìm kiếm', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5ac051e2-1116-4ed2-834d-b0b494af92e8', v_m_m1_a_01, 'M1-A-01-02', 'Định nghĩa', 'TEXT', '- Môi trường số (Điều 2, TT 02/2025/TT-BGDĐT): không gian ảo, nơi các hoạt động, dữ liệu, thông tin và nội dung được tạo ra, lưu trữ và trao đổi thông qua công nghệ số, như mạng Internet, phần mềm và các nền tảng trực tuyến

- Điều hướng (Điều 2, TT 02/2025/TT-BGDĐT): quá trình định hướng và di chuyển trong một không gian vật lý hoặc kỹ thuật số nhằm xác định vị trí hiện tại và tìm ra đường đi đến đích mong muốn

- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Tam giác hóa: phương pháp dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy

- Khoảng trống thông tin: phần dữ liệu cần thiết nhưng không có sẵn, cần được ước lượng có căn cứ hoặc thu thập thêm', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0ee4b272-e3c8-4672-8fde-4e86e22baf10', v_m_m1_a_01, 'M1-A-01-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc đánh giá nhu cầu thông tin và điều chỉnh chiến lược tìm kiếm phù hợp nhất trong bối cảnh phức tạp đòi hỏi thiết kế cả một phương pháp nghiên cứu, không chỉ một lượt tìm kiếm đơn lẻ.

Từ một câu hỏi kinh doanh mơ hồ, cần xây dựng kế hoạch nghiên cứu rõ ràng, phối hợp nguồn bên ngoài (báo cáo ngành, số liệu chính thức) với dữ liệu nội bộ của doanh nghiệp. Tam giác hóa — dùng từ ba nguồn độc lập trở lên để xác lập một khoảng giá trị đáng tin cậy — giúp tăng độ tin cậy của kết luận. Khi dữ liệu không tồn tại, cần nhận diện khoảng trống thông tin và đưa ra ước lượng có căn cứ thay vì bỏ qua. Ở mức này, người học còn cần hướng dẫn được đồng nghiệp cách tìm kiếm hiệu quả — đúng như Thông tư mô tả “hướng dẫn người khác” ở bậc 5.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('21f95ddf-77f3-4db1-8fa1-ab646cd332f6', v_m_m1_a_01, 'M1-A-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Doanh nghiệp cân nhắc một quyết định kinh doanh quan trọng. Xây kế hoạch nghiên cứu theo khung bốn bước, thu thập bằng chứng từ tối thiểu hai loại nguồn (bên ngoài và nội bộ), xác định rõ phần nào còn là khoảng trống thông tin và đề xuất cách ước lượng, rồi trình bày phần bằng chứng thu được và phần còn thiếu cho nhóm.

Sản phẩm nộp: Kế hoạch nghiên cứu, hồ sơ bằng chứng, danh mục khoảng trống thông tin.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('83d0ea8a-054b-4af7-b963-e1bd95087da2', v_m_m1_a_01, 'M1-A-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bước đầu tiên khi đối mặt với một vấn đề nghiên cứu chưa rõ ràng là gì? A. Tìm kiếm ngay trên Google B. Xác định quyết định nào đang cần được đưa ra C. Hỏi ý kiến đồng nghiệp D. Thu thập càng nhiều dữ liệu càng tốt Đáp án: B — Xác định quyết định cần hỗ trợ giúp định hướng toàn bộ quá trình nghiên cứu.

2. Vì sao cần phối hợp cả nguồn bên ngoài và nội bộ khi nghiên cứu mở rộng thị trường? A. Để có nhiều số liệu hơn B. Nguồn bên ngoài cho biết thị trường, nguồn nội bộ cho biết vị trí thực tế của doanh nghiệp C. Vì quy định yêu cầu D. Không cần thiết, một loại là đủ Đáp án: B — Hai loại nguồn trả lời hai câu hỏi khác nhau, cần kết hợp để có bức tranh đầy đủ.

3. Khi dữ liệu cần thiết không tồn tại, cách xử lý đúng là gì? A. Bỏ qua vấn đề đó B. Nêu rõ khoảng trống và đưa ra ước lượng có căn cứ, ghi rõ đó là ước lượng C. Giả định một con số bất kỳ D. Trì hoãn toàn bộ nghiên cứu Đáp án: B — Minh bạch về khoảng trống và ước lượng có căn cứ tốt hơn giả định ngầm hoặc bỏ qua.

4. Tam giác hóa trong nghiên cứu nghĩa là gì? A. Vẽ biểu đồ hình tam giác B. Dùng ít nhất ba nguồn độc lập để xác lập khoảng giá trị đáng tin C. Chia dữ liệu thành ba phần D. Kiểm tra dữ liệu ba lần Đáp án: B — Ba nguồn độc lập giúp xác lập độ tin cậy cao hơn một nguồn đơn lẻ.

5. Hướng dẫn đồng nghiệp tìm kiếm hiệu quả bao gồm việc gì? A. Tự làm hết thay họ B. Chia sẻ mẫu chiến lược tìm kiếm và review cách đặt câu hỏi C. Không can thiệp D. Chỉ giao việc mà không hướng dẫn Đáp án: B — Chuẩn hóa và chia sẻ phương pháp giúp nâng cao năng lực chung của nhóm.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('775bfc1d-86d0-42b5-83ad-3f94f5ced785', v_m_m1_a_02, 'M1-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá có tính phê phán được độ tin cậy và độ chính xác của các nguồn dữ liệu, thông tin và nội dung số

- Đánh giá có tính phê phán được dữ liệu, thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c18330fd-aa79-46a9-b306-db43da03928e', v_m_m1_a_02, 'M1-A-02-02', 'Định nghĩa', 'TEXT', '- Thông tin (Điều 2, TT 02/2025/TT-BGDĐT): dữ liệu đã được tổ chức, xử lý, hoặc phân tích để trở nên có ý nghĩa và có thể hiểu được và sử dụng để ra quyết định, giải quyết vấn đề hoặc truyền đạt ý tưởng

- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Chất lượng dữ liệu: mức độ dữ liệu đáp ứng được sáu tiêu chí — chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất

- Biện pháp phòng ngừa: hành động chặn dữ liệu sai ngay tại điểm nhập liệu

- Biện pháp phát hiện: hành động tìm ra dữ liệu sai sau khi đã được nhập vào hệ thống', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('241b1b0f-0475-4702-9d78-e2989035708b', v_m_m1_a_02, 'M1-A-02-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc đánh giá có tính phê phán độ tin cậy và độ chính xác của nguồn dữ liệu mở rộng thành đánh giá chất lượng dữ liệu một cách hệ thống theo sáu chiều: chính xác, đầy đủ, nhất quán, kịp thời, hợp lệ, duy nhất.

Cần viết được quy tắc kiểm tra dữ liệu có thể áp dụng máy móc (ví dụ: số điện thoại phải đủ 10 chữ số). Biện pháp phòng ngừa được đặt tại điểm nhập liệu để chặn lỗi từ đầu; biện pháp phát hiện dùng báo cáo ngoại lệ và đối chiếu để tìm lỗi đã lọt qua. Xây bảng điểm chất lượng dữ liệu có ngưỡng cụ thể và người chịu trách nhiệm giúp duy trì chất lượng theo thời gian, đồng thời cần phân biệt dữ liệu sai với dữ liệu chỉ đơn thuần bất thường.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f8ea4819-ef56-4252-86c5-0981b80fa285', v_m_m1_a_02, 'M1-A-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cho một tập dữ liệu khách hàng thật của doanh nghiệp, hãy chấm điểm cả sáu chiều bằng số liệu cụ thể (ví dụ tính phần trăm trường trống), đề xuất tối thiểu sáu quy tắc kiểm tra, và với mỗi biện pháp cải thiện đề xuất, phân loại là phòng ngừa hay phát hiện, gán người phụ trách.

Sản phẩm nộp: Bảng điểm chất lượng dữ liệu, bộ quy tắc kiểm tra, kế hoạch kiểm soát.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3c25380e-b952-4728-a04d-46220871226b', v_m_m1_a_02, 'M1-A-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Một email đúng định dạng nhưng gán sai cho khách hàng khác là vi phạm chiều nào? A. Hợp lệ B. Chính xác C. Đầy đủ D. Duy nhất Đáp án: B — Định dạng đúng (hợp lệ) nhưng không phản ánh đúng thực tế (không chính xác).

2. Biện pháp nào sau đây là biện pháp phòng ngừa? A. Báo cáo ngoại lệ hàng tuần B. Danh sách chọn sẵn bắt buộc khi nhập liệu C. Đối chiếu dữ liệu định kỳ D. Rà soát thủ công cuối tháng Đáp án: B — Danh sách chọn sẵn chặn lỗi ngay tại điểm nhập liệu, trước khi lỗi xảy ra.

3. Một khách hàng có ba mã khách hàng khác nhau trong hệ thống là vấn đề của chiều nào? A. Kịp thời B. Duy nhất C. Hợp lệ D. Chính xác Đáp án: B — Một thực thể được ghi nhận nhiều lần vi phạm tính duy nhất.

4. Vì sao nên ưu tiên biện pháp phòng ngừa hơn phát hiện? A. Phòng ngừa rẻ hơn luôn luôn B. Phòng ngừa giải quyết tận gốc, giảm nhu cầu dọn dẹp lặp lại C. Phát hiện không hiệu quả D. Không có sự khác biệt Đáp án: B — Ngăn lỗi xảy ra tốt hơn liên tục phải sửa lỗi sau khi đã phát sinh.

5. Bảng điểm chất lượng dữ liệu cần có yếu tố nào để thực sự thúc đẩy cải thiện? A. Chỉ cần con số phần trăm B. Ngưỡng mục tiêu và người chịu trách nhiệm cụ thể C. Màu sắc đẹp D. Càng nhiều chiều đo càng tốt Đáp án: B — Không có người chịu trách nhiệm, bảng điểm không tạo ra hành động cải thiện.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1249dc04-9658-4ccd-a947-7289670e56e9', v_m_m1_a_03, 'M1-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Điều chỉnh được việc quản lý thông tin, dữ liệu và nội dung để dễ dàng nhất cho việc thu hồi và lưu trữ

- Điều chỉnh được thông tin, dữ liệu và nội dung để chúng được tổ chức và sắp xếp trong môi trường có cấu trúc phù hợp nhất', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('111aa078-8551-4883-9c92-dfce89c04a70', v_m_m1_a_03, 'M1-A-03-02', 'Định nghĩa', 'TEXT', '- Dữ liệu (Điều 2, TT 02/2025/TT-BGDĐT): những con số hoặc dữ kiện rời rạc mà quan sát hoặc đo đếm được không cần có ngữ cảnh hay diễn giải; được thể hiện ra ngoài bằng cách mã hóa và dễ dàng truyền tải và được chuyển thành thông tin bằng cách thêm giá trị thông qua ngữ cảnh, phân loại, tính toán, hiệu chỉnh và đánh giá

- Môi trường có cấu trúc (Điều 2, TT 02/2025/TT-BGDĐT): một không gian hoặc hệ thống trong đó các yếu tố, thành phần hoặc dữ liệu được tổ chức và sắp xếp theo một cách rõ ràng và có quy tắc, giúp dễ dàng tìm kiếm, truy cập và xử lý

- Quản trị dữ liệu: hệ thống các quy tắc, vai trò và quy trình đảm bảo dữ liệu được định nghĩa, sử dụng và bảo vệ nhất quán trong tổ chức

- Từ điển dữ liệu: bảng mô tả chi tiết từng trường dữ liệu — định nghĩa, kiểu, giá trị hợp lệ, nguồn, chủ sở hữu

- Nguồn chân lý duy nhất: hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, mọi bản sao khác chỉ mang tính tham khảo', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('81c905e1-1c98-41b7-96ee-382ab31239e4', v_m_m1_a_03, 'M1-A-03-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc điều chỉnh quản lý thông tin và tổ chức môi trường có cấu trúc phù hợp nhất trong bối cảnh phức tạp mở rộng thành quản trị dữ liệu và vòng đời thông tin cấp tổ chức.

Ba vai trò cần được phân định rõ: chủ sở hữu dữ liệu (chịu trách nhiệm cuối cùng), người quản lý dữ liệu (duy trì chất lượng hàng ngày), người vận hành (sử dụng dữ liệu trong công việc). Từ điển dữ liệu ghi lại tên trường, định nghĩa, kiểu dữ liệu, giá trị hợp lệ, nguồn gốc và mức nhạy cảm cho một tập dữ liệu cốt lõi. Khái niệm dữ liệu chủ và nguồn chân lý duy nhất giúp chấm dứt tình trạng các bộ phận báo cáo số liệu khác nhau cho cùng một chỉ tiêu. Lịch lưu trữ và hủy dữ liệu cần tuân theo yêu cầu pháp lý và nghiệp vụ.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1d661581-b201-4a41-ab71-33b2e657e939', v_m_m1_a_03, 'M1-A-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Hai bộ phận trong doanh nghiệp báo cáo số khách hàng khác nhau mỗi tháng, gây tranh cãi liên tục. Xây từ điển dữ liệu tối thiểu 10 trường, phân định ba vai trò cho tập dữ liệu này, thống nhất một định nghĩa cho chỉ tiêu đang gây tranh cãi, và lập lịch lưu trữ cho ba loại dữ liệu khác nhau trong doanh nghiệp.

Sản phẩm nộp: Từ điển dữ liệu (≥10 trường), bảng phân vai, định nghĩa chỉ tiêu thống nhất, lịch lưu trữ.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7727e017-bc6f-4345-a3a3-24e2a2468c81', v_m_m1_a_03, 'M1-A-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Hai bộ phận báo cáo số khách hàng khác nhau. Cách xử lý đúng theo quản trị dữ liệu là gì? A. Tính lại số liệu B. Thống nhất và ghi lại một định nghĩa trong từ điển dữ liệu C. Dùng số liệu cao hơn D. Lấy trung bình cộng Đáp án: B — Vấn đề nằm ở định nghĩa, không phải phép tính; cần thống nhất và ghi chép lại.

2. Người quản lý dữ liệu (data steward) có vai trò gì? A. Chịu trách nhiệm cuối cùng và phê duyệt quyền truy cập B. Duy trì chất lượng và định nghĩa dữ liệu hàng ngày C. Vận hành hạ tầng kỹ thuật D. Không có vai trò cụ thể Đáp án: B — Chủ sở hữu chịu trách nhiệm cuối; người quản lý duy trì vận hành hàng ngày.

3. “Nguồn chân lý duy nhất” nghĩa là gì? A. Nguồn dữ liệu duy nhất tồn tại B. Một hệ thống được chỉ định là nguồn chính thức cho một chỉ tiêu, các bản khác chỉ là bản sao C. Chỉ có một người được xem dữ liệu D. Dữ liệu không bao giờ thay đổi Đáp án: B — Chỉ định một nguồn chính thức tránh nhầm lẫn giữa nhiều bản sao.

4. Lịch lưu trữ và hủy dữ liệu nên được quyết định dựa trên điều gì? A. Dung lượng lưu trữ còn trống B. Yêu cầu pháp lý và nhu cầu nghiệp vụ C. Sở thích cá nhân của quản lý D. Không cần quyết định, giữ mãi mãi là an toàn nhất Đáp án: B — Giữ dữ liệu vô thời hạn không phải an toàn, mà là rủi ro pháp lý và bảo mật.

5. Từ điển dữ liệu chủ yếu giúp giải quyết vấn đề gì? A. Tăng tốc độ xử lý dữ liệu B. Tranh cãi số liệu do khác biệt định nghĩa giữa các bộ phận C. Giảm dung lượng lưu trữ D. Mã hóa dữ liệu Đáp án: B — Định nghĩa thống nhất, được ghi chép, loại bỏ nguyên nhân phổ biến nhất của tranh cãi số liệu.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b9de43bc-f176-40cc-b43b-040945027298', v_m_m2_f_01, 'M2-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Lựa chọn được các công nghệ số đơn giản để tương tác

- Xác định được các phương tiện giao tiếp đơn giản thích hợp cho một bối cảnh cụ thể', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('65ff3a77-7209-4ad9-89e7-0f78f705bbc5', v_m_m2_f_01, 'M2-F-01-02', 'Định nghĩa', 'TEXT', '- Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử

- Đến (To): người nhận chính, người cần hành động

- CC (Carbon Copy): người được thông báo để biết, không cần hành động

- BCC (Blind Carbon Copy): người nhận ẩn, các người nhận khác không thấy nhau

- Kênh giao tiếp: phương tiện dùng để truyền thông điệp — email, tin nhắn, họp trực tuyến, gọi điện', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ba09d2c7-579f-4bc7-a796-4efaa14c7f3b', v_m_m2_f_01, 'M2-F-01-03', 'Nội dung', 'TEXT', 'Tương tác thông qua công nghệ số nghĩa là dùng các công cụ số (email, ứng dụng nhắn tin, họp trực tuyến) để trao đổi với người khác. Mỗi loại phương tiện giao tiếp số phù hợp với một bối cảnh khác nhau — việc gấp cần công cụ tức thời như gọi điện hoặc nhắn tin trực tiếp; việc cần lưu vết lâu dài nên dùng email; việc cần nhiều người cùng thảo luận phù hợp với họp trực tuyến hoặc nhóm chat.

Một email công việc cơ bản có bốn phần: tiêu đề rõ ràng, lời chào, nội dung chính, và chữ ký. Về việc dùng Đến, CC và BCC: đặt người cần hành động vào ô Đến, người chỉ cần biết vào ô CC.

Khi tham gia họp trực tuyến, cần kiểm tra âm thanh và hình ảnh trước khi họp bắt đầu, và tắt tiếng khi không phát biểu để tránh tạp âm ảnh hưởng người khác.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5f5c493b-18b1-4eff-9ed3-2ce90ae8f200', v_m_m2_f_01, 'M2-F-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Soạn ba email cho ba tình huống khác nhau: xin thông tin từ đồng nghiệp, báo cáo tiến độ công việc cho cấp trên, và xin lỗi vì trễ hạn công việc. Sau đó tham gia thử một cuộc họp trực tuyến và ghi chú lại nội dung.

Sản phẩm nộp: 3 email mẫu và ghi chú cuộc họp.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8be50a93-046d-47b2-98fb-f6f81004670a', v_m_m2_f_01, 'M2-F-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Người cần hành động với nội dung email nên được đặt ở đâu? A. CC B. BCC C. Đến (To) D. Không quan trọng Đáp án: C — Đến (To) dành cho người cần thực hiện hành động.

2. BCC được dùng khi nào? A. Khi muốn tất cả người nhận biết nhau B. Khi gửi cho nhiều người không cần lộ thông tin liên hệ của nhau C. Khi chỉ gửi cho một người D. Không bao giờ nên dùng Đáp án: B — BCC ẩn danh sách người nhận với nhau.

3. Việc gấp cần xử lý ngay nên chọn kênh nào? A. Email B. Gọi điện hoặc nhắn tin trực tiếp C. Ghi chú giấy D. Gửi thư Đáp án: B — Kênh tức thời phù hợp với việc cần phản hồi nhanh.

4. Vì sao nên tắt tiếng khi không phát biểu trong cuộc họp trực tuyến? A. Để tiết kiệm pin B. Để tránh tạp âm ảnh hưởng người khác C. Vì bắt buộc theo quy định D. Không có lý do cụ thể Đáp án: B — Tạp âm nền gây khó chịu và làm gián đoạn cuộc họp.

5. Tiêu đề email nên có đặc điểm gì? A. Càng ngắn càng tốt, không cần rõ nghĩa B. Nói rõ nội dung để người nhận biết mức ưu tiên C. Chỉ cần viết “Quan trọng” D. Không cần thiết Đáp án: B — Tiêu đề rõ ràng giúp người nhận đánh giá và xử lý phù hợp.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('46d1561e-cd5f-4505-9cd1-859c4f8f8242', v_m_m2_f_02, 'M2-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Nhận biết được các công nghệ số đơn giản, phù hợp để chia sẻ dữ liệu, thông tin và nội dung số

- Nhận biết được tham chiếu và ghi chú nguồn cơ bản', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('569ad345-aa0c-4d57-9a8f-2d22d176eff3', v_m_m2_f_02, 'M2-F-02-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Quyền xem: chỉ đọc, không thể thay đổi nội dung

- Quyền bình luận: đọc và để lại nhận xét, không sửa nội dung gốc

- Quyền chỉnh sửa: có thể thay đổi trực tiếp nội dung

- Liên kết chia sẻ: đường dẫn cho phép truy cập tệp mà không cần gửi trực tiếp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6587b261-ae16-471c-ae03-a00e5ec6ea7c', v_m_m2_f_02, 'M2-F-02-03', 'Nội dung', 'TEXT', 'Chia sẻ thông tin và nội dung số nghĩa là gửi hoặc cấp quyền truy cập tài liệu cho người khác thông qua các công nghệ số phù hợp. Khi tệp quá lớn để đính kèm qua email, nên chia sẻ qua đường dẫn đám mây thay vì cố nén và gửi trực tiếp.

Ba mức quyền phổ biến là xem, bình luận, và chỉnh sửa — nên cấp mức thấp nhất phù hợp với nhu cầu người nhận. Tùy chọn “Bất kỳ ai có liên kết” tiềm ẩn rủi ro: đường dẫn có thể bị chuyển tiếp ngoài ý muốn tới người không nên xem.

Trước khi chuyển tiếp một email, cần kiểm tra xem nội dung phía trên (các email trước đó trong chuỗi) có thông tin không nên gửi cho người nhận mới hay không.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b34785bf-544b-4a3a-954b-f3493a8271c6', v_m_m2_f_02, 'M2-F-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chia sẻ một thư mục với một đồng nghiệp ở mức chỉ xem, và chụp lại màn hình cài đặt chia sẻ.

Sản phẩm nộp: Ảnh chụp cài đặt chia sẻ đúng nguyên tắc.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c5d808ee-0cb8-4f65-8d83-1b5956a675c0', v_m_m2_f_02, 'M2-F-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khi tệp quá lớn để đính kèm, nên làm gì? A. Nén thật nhỏ và gửi B. Chia sẻ qua đường dẫn đám mây C. Gửi qua nhiều email D. Bỏ bớt nội dung Đáp án: B — Chia sẻ đường dẫn đám mây phù hợp cho tệp lớn.

2. Mức quyền nào nên cấp mặc định khi chưa rõ nhu cầu người nhận? A. Chỉnh sửa B. Xem C. Quản trị D. Xóa Đáp án: B — Bắt đầu từ mức thấp nhất, chỉ nâng khi cần.

3. “Bất kỳ ai có liên kết” tiềm ẩn rủi ro gì? A. Không có rủi ro nào B. Liên kết có thể bị chuyển tiếp tới người không nên xem C. Tốc độ tải chậm hơn D. Tốn dung lượng hơn Đáp án: B — Liên kết mở dễ lan truyền ngoài kiểm soát.

4. Trước khi chuyển tiếp một chuỗi email, nên kiểm tra điều gì? A. Độ dài email B. Nội dung phía trên có thông tin không nên gửi cho người nhận mới không C. Ngày gửi ban đầu D. Không cần kiểm tra gì Đáp án: B — Chuỗi email cũ có thể chứa thông tin nhạy cảm không phù hợp chuyển tiếp.

5. Quyền “bình luận” khác quyền “chỉnh sửa” ở điểm nào? A. Không có khác biệt B. Bình luận chỉ để lại nhận xét, không sửa nội dung gốc C. Bình luận có quyền cao hơn D. Chỉnh sửa không được lưu lại Đáp án: B — Bình luận giữ nguyên nội dung gốc, chỉ thêm ghi chú.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('faed17d7-80df-4e5c-b016-85c931d92658', v_m_m2_f_03, 'M2-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các dịch vụ số đơn giản để có thể tham gia vào xã hội

- Nhận biết được các công nghệ số đơn giản, phù hợp để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ed1a8b79-f905-4176-a43c-e7ebc9483c58', v_m_m2_f_03, 'M2-F-03-02', 'Định nghĩa', 'TEXT', '- Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số

- Cổng dịch vụ công: trang web chính thức của cơ quan nhà nước cho phép thực hiện thủ tục hành chính trực tuyến

- Định danh điện tử: phương thức xác thực danh tính một cá nhân hoặc tổ chức trên môi trường số

- Chữ ký số: hình thức xác nhận điện tử có giá trị pháp lý tương đương chữ ký tay', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ea0703a8-0e9b-4b77-b09f-98b79d50d8ee', v_m_m2_f_03, 'M2-F-03-03', 'Nội dung', 'TEXT', 'Sử dụng công nghệ số để thực hiện trách nhiệm công dân nghĩa là tham gia vào xã hội thông qua các dịch vụ số công cộng và tư nhân — ví dụ cổng dịch vụ công trực tuyến cho phép thực hiện nhiều thủ tục hành chính mà không cần đến trực tiếp cơ quan nhà nước.

Khi tra cứu thông tin chính thức, cần xác nhận đang ở đúng trang của cơ quan nhà nước. Trang giả mạo thường có tên miền gần giống nhưng sai khác nhỏ, và thường yêu cầu cung cấp thông tin cá nhân qua kênh không chính thức. Cơ quan nhà nước không bao giờ yêu cầu mật khẩu hoặc mã xác thực qua điện thoại hoặc tin nhắn.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('03620629-4bee-46b4-b2c7-48928cd3408c', v_m_m2_f_03, 'M2-F-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tra cứu một thủ tục hành chính liên quan đến doanh nghiệp trên cổng chính thức và ghi lại các bước cùng giấy tờ cần có.

Sản phẩm nộp: Bảng tóm tắt thủ tục kèm đường dẫn chính thức.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2cb3bd17-f71a-4a42-885f-3a12a4c3f822', v_m_m2_f_03, 'M2-F-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Cổng dịch vụ công dùng để làm gì? A. Mua sắm trực tuyến B. Thực hiện thủ tục hành chính không cần đến trực tiếp C. Giải trí D. Tìm việc làm Đáp án: B — Đây là chức năng chính của cổng dịch vụ công.

2. Dấu hiệu nào cho thấy một trang có thể giả mạo cơ quan nhà nước? A. Có đuôi .gov.vn B. Tên miền gần giống nhưng sai khác nhỏ, yêu cầu thông tin bất thường C. Giao diện đơn giản D. Có nhiều thông tin liên hệ Đáp án: B — Đây là các dấu hiệu cảnh báo phổ biến của trang giả mạo.

3. Cơ quan nhà nước có bao giờ yêu cầu cung cấp mật khẩu qua điện thoại không? A. Có, đây là quy trình bình thường B. Không, đây là dấu hiệu lừa đảo C. Chỉ trong trường hợp khẩn cấp D. Tùy từng cơ quan Đáp án: B — Yêu cầu mật khẩu/mã OTP qua điện thoại là dấu hiệu lừa đảo, không phải quy trình chính thức.

4. Định danh điện tử dùng để làm gì? A. Trang trí hồ sơ B. Xác thực danh tính trên môi trường số C. Tăng tốc độ mạng D. Không có tác dụng cụ thể Đáp án: B — Đây là mục đích chính của định danh điện tử.

5. Chữ ký số có giá trị pháp lý như thế nào? A. Không có giá trị pháp lý B. Tương đương chữ ký tay C. Chỉ dùng cho mục đích nội bộ D. Chỉ có giá trị ở nước ngoài Đáp án: B — Chữ ký số có giá trị pháp lý tương đương chữ ký tay theo quy định.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('898542ce-b7e0-410f-88fb-2e36e57f43b3', v_m_m2_f_04, 'M2-F-04-01', 'Mục tiêu học tập', 'TEXT', '- Chọn được những công cụ và công nghệ số đơn giản cho các quá trình hợp tác', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('32ef9525-25ae-4bf4-bff9-9fe6009827fc', v_m_m2_f_04, 'M2-F-04-02', 'Định nghĩa', 'TEXT', '- Tài liệu dùng chung: tài liệu trực tuyến nhiều người có thể xem hoặc chỉnh sửa đồng thời

- Bình luận (comment): ghi chú gắn vào một phần cụ thể của tài liệu, không thay đổi nội dung gốc

- Bảng công việc (task board): công cụ hiển thị công việc theo trạng thái (chưa làm, đang làm, hoàn thành)', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('007e0e1c-a8d8-4552-9212-5df1365ea778', v_m_m2_f_04, 'M2-F-04-03', 'Nội dung', 'TEXT', 'Hợp tác thông qua công nghệ số nghĩa là dùng các công cụ số cho quá trình làm việc chung — tài liệu dùng chung cho phép nhiều người chỉnh sửa cùng lúc và tự động lưu thay đổi. Khi cần góp ý mà không muốn thay đổi trực tiếp nội dung, dùng tính năng bình luận.

Trên bảng công việc, mỗi thẻ công việc thường có người phụ trách, hạn hoàn thành, và trạng thái hiện tại. Một lưu ý quan trọng: không nên tạo bản sao riêng của tài liệu nhóm để chỉnh sửa cá nhân — điều này tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn cho cả nhóm.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('733ac16a-a7ea-45f3-b8ff-be750dd9a599', v_m_m2_f_04, 'M2-F-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cùng một hoặc hai người khác hoàn thành một tài liệu dùng chung, mỗi người phụ trách một phần, sử dụng bình luận để trao đổi.

Sản phẩm nộp: Tài liệu nhóm có lịch sử chỉnh sửa và bình luận.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('25438c55-88c9-4543-862a-643eed90b7b0', v_m_m2_f_04, 'M2-F-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao không nên tạo bản sao riêng của tài liệu nhóm? A. Tốn dung lượng B. Tạo ra nhiều phiên bản không đồng bộ, gây nhầm lẫn C. Không có lý do gì D. Vì quy định cấm Đáp án: B — Nhiều bản sao khiến khó xác định phiên bản nào là chính thức.

2. Tính năng bình luận khác gì so với chỉnh sửa trực tiếp? A. Không có khác biệt B. Bình luận không thay đổi nội dung gốc, chỉ thêm ghi chú C. Bình luận nhanh hơn D. Chỉnh sửa không thể hoàn tác Đáp án: B — Bình luận là góp ý riêng biệt, giữ nguyên nội dung chính.

3. Lịch dùng chung giúp ích gì cho nhóm? A. Trang trí B. Thấy được thời gian rảnh của nhau để đặt lịch họp C. Tính lương D. Không có tác dụng Đáp án: B — Đây là công dụng chính của lịch dùng chung.

4. Trên bảng công việc, thông tin nào cần được cập nhật thường xuyên? A. Tên công việc B. Trạng thái hiện tại C. Ngày tạo công việc D. Không cần cập nhật gì Đáp án: B — Cập nhật trạng thái giúp cả nhóm nắm tiến độ.

5. Gắn thẻ (@) một người trong bình luận có tác dụng gì? A. Xóa bình luận đó B. Gửi thông báo để người đó biết C. Ẩn bình luận D. Không có tác dụng Đáp án: B — Gắn thẻ thông báo trực tiếp tới người được nhắc đến.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f7fefbf1-f8ed-4f2d-90d8-e95cf2f4c5c8', v_m_m2_f_05, 'M2-F-05-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được các chuẩn mực hành vi đơn giản và biết cách sử dụng công nghệ số và tương tác trong môi trường số

- Chọn được các phương thức và chiến lược giao tiếp đơn giản phù hợp trong môi trường số

- Phân biệt được các khía cạnh đơn giản của sự đa dạng về văn hóa và thế hệ', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8ec2b36d-009e-42fa-a99c-89c9bd357ee6', v_m_m2_f_05, 'M2-F-05-02', 'Định nghĩa', 'TEXT', '- Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến

- Văn phong: cách diễn đạt, mức độ trang trọng trong giao tiếp

- Quấy rối trên môi trường số: hành vi lặp lại gây khó chịu, đe dọa hoặc xúc phạm qua kênh số', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6a2763d1-652a-49b9-b3bd-a7da63041703', v_m_m2_f_05, 'M2-F-05-03', 'Nội dung', 'TEXT', 'Nghi thức số là tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến. Cách giao tiếp với đồng nghiệp, cấp trên và khách hàng nên khác nhau về mức độ trang trọng.

Việc dùng biểu tượng cảm xúc hay viết hoa toàn bộ câu cần cân nhắc theo ngữ cảnh — viết hoa toàn bộ thường được hiểu là đang hét lên. Thời điểm gửi tin nhắn cũng là một phần của nghi thức số: gửi tin nhắn công việc ngoài giờ có thể tạo áp lực không cần thiết.

Khi nhận được tin nhắn mang tính công kích, nên lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp thay vì tự giải quyết bằng cách đáp trả tương tự.

Đồng nghiệp trong một công ty có thể khác nhau về văn hóa (người miền Bắc/Nam/Trung, người nước ngoài) và về thế hệ (Gen Z mới đi làm, người đã đi làm 20 năm) — mỗi nhóm có thể quen với cách giao tiếp khác nhau. Ví dụ: một số người lớn tuổi thấy nhắn tin quá ngắn gọn là thiếu lễ độ, trong khi một số người trẻ thấy email dài dòng là mất thời gian. Nhận biết được sự khác biệt đơn giản này giúp chọn cách giao tiếp phù hợp hơn với từng người, thay vì áp dụng một kiểu duy nhất cho tất cả.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('78ff6280-8507-4cbc-b35a-f1ec86136a89', v_m_m2_f_05, 'M2-F-05-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Cho năm tin nhắn công việc có vấn đề về văn phong, viết lại cho phù hợp và giải thích điều chỉnh.

Sản phẩm nộp: Bảng 5 tin nhắn trước và sau kèm giải thích.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fd0b6d8f-1cc7-41a3-a447-c4d93251c2c9', v_m_m2_f_05, 'M2-F-05-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Viết hoa toàn bộ câu trong tin nhắn thường được hiểu là gì? A. Nhấn mạnh lịch sự B. Đang hét lên, có thể gây hiểu lầm C. Không có ý nghĩa gì D. Thể hiện sự trang trọng Đáp án: B — Viết hoa toàn bộ thường bị hiểu là ngữ điệu gay gắt.

2. Gửi tin nhắn công việc ngoài giờ có thể gây ra điều gì? A. Không ảnh hưởng gì B. Tạo áp lực không cần thiết cho người nhận C. Luôn được hoan nghênh D. Tăng hiệu suất làm việc Đáp án: B — Trừ trường hợp khẩn cấp, nên tôn trọng thời gian nghỉ của người nhận.

3. Khi nhận tin nhắn mang tính công kích, nên làm gì đầu tiên? A. Đáp trả ngay lập tức bằng lời lẽ tương tự B. Lưu lại bằng chứng và báo cáo cho người phụ trách phù hợp C. Xóa ngay tin nhắn D. Phớt lờ hoàn toàn Đáp án: B — Lưu bằng chứng và báo cáo là cách xử lý phù hợp, tránh leo thang xung đột.

4. Văn phong khi giao tiếp với khách hàng nên như thế nào? A. Giống hệt như với bạn bè B. Lịch sự, đầy đủ câu C. Ngắn gọn tối đa, không cần lịch sự D. Không quan trọng Đáp án: B — Giao tiếp với khách hàng cần giữ sự chuyên nghiệp và lịch sự.

5. Vì sao cần lưu ý sự khác biệt văn hóa và thế hệ khi giao tiếp với đồng nghiệp? A. Không cần thiết, giao tiếp giống nhau với tất cả mọi người B. Mỗi nhóm có thể quen với cách giao tiếp khác nhau, cần điều chỉnh phù hợp C. Chỉ áp dụng với đối tác nước ngoài D. Chỉ người lớn tuổi cần được lưu ý Đáp án: B — Nhận biết sự khác biệt giúp chọn cách giao tiếp phù hợp hơn với từng người thay vì áp dụng một kiểu cho tất cả.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('12143f80-8ef3-4e73-8324-a9c1689b7190', v_m_m2_f_06, 'M2-F-06-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được danh tính số

- Mô tả được những cách đơn giản để bảo vệ danh tiếng trực tuyến của bản thân

- Nhận biết được dữ liệu đơn giản do mình tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1d5b30da-b8c3-458a-ab44-1fad1339ad6a', v_m_m2_f_06, 'M2-F-06-02', 'Định nghĩa', 'TEXT', '- Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác

- Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến

- Dấu vết số (digital footprint): toàn bộ thông tin về một người còn lại trên môi trường số qua các hoạt động trực tuyến', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('36711730-a539-46cd-872e-8db907ffc53f', v_m_m2_f_06, 'M2-F-06-03', 'Nội dung', 'TEXT', 'Danh tính số là tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác. Mọi hoạt động trực tuyến đều để lại dấu vết có thể tồn tại rất lâu, kể cả sau khi nội dung gốc đã bị xóa.

Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp biết được người khác nhìn thấy gì về mình. Cài đặt quyền riêng tư trên mạng xã hội nên được rà soát định kỳ. Nên tách bạch tài khoản cá nhân và tài khoản dùng cho công việc khi có thể, để bảo vệ danh tiếng trực tuyến của bản thân.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ebe3765f-c5c3-4d3e-8125-617cb083d728', v_m_m2_f_06, 'M2-F-06-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tự tra cứu tên mình trên công cụ tìm kiếm, liệt kê những gì công khai, rà soát và điều chỉnh cài đặt riêng tư của một tài khoản.

Sản phẩm nộp: Bảng kiểm dấu vết số cá nhân trước và sau điều chỉnh.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7d39c969-63f3-4273-a504-87683ed51308', v_m_m2_f_06, 'M2-F-06-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Dấu vết số là gì? A. Chữ ký điện tử B. Toàn bộ thông tin về một người còn lại trên môi trường số C. Mật khẩu tài khoản D. Địa chỉ IP Đáp án: B — Đây là định nghĩa của dấu vết số.

2. Nội dung đã xóa trên mạng có thể vẫn tồn tại vì sao? A. Không thể nào tồn tại được nữa B. Người khác có thể đã lưu hoặc chia sẻ lại trước khi xóa C. Máy chủ luôn giữ vĩnh viễn D. Không có lý do cụ thể Đáp án: B — Việc sao chép hoặc chia sẻ trước khi xóa khiến nội dung vẫn tồn tại ở nơi khác.

3. Vì sao nên tách bạch tài khoản cá nhân và công việc? A. Không cần thiết B. Tránh nội dung cá nhân ảnh hưởng hình ảnh nghề nghiệp và ngược lại C. Chỉ để tiết kiệm dung lượng D. Vì quy định pháp luật bắt buộc Đáp án: B — Tách bạch giúp bảo vệ cả đời sống cá nhân và hình ảnh nghề nghiệp.

4. Việc tự tra cứu tên mình trên công cụ tìm kiếm giúp ích gì? A. Không có tác dụng gì B. Biết được người khác nhìn thấy gì về mình trên mạng C. Tăng thứ hạng tìm kiếm D. Xóa dấu vết số Đáp án: B — Đây là cách đơn giản để kiểm tra hình ảnh công khai của bản thân.

5. Đăng hình ảnh đồng nghiệp lên tài khoản cá nhân mà không xin phép có vấn đề gì? A. Không có vấn đề gì B. Có thể vi phạm quyền riêng tư của người khác C. Luôn được khuyến khích D. Chỉ có vấn đề nếu đăng công khai Đáp án: B — Cần có sự đồng ý trước khi đăng tải hình ảnh hoặc thông tin của người khác.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a73c3632-5d8a-4425-8ec7-97ed59b962b0', v_m_m2_i_01, 'M2-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Lựa chọn được nhiều công nghệ số để tương tác

- Lựa chọn được nhiều phương tiện giao tiếp số phù hợp cho một bối cảnh cụ thể', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6476c5ef-df10-4ae3-90d8-e24d7ff14e99', v_m_m2_i_01, 'M2-I-01-02', 'Định nghĩa', 'TEXT', '- Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử

- Giao tiếp bất đồng bộ: giao tiếp không yêu cầu phản hồi ngay lập tức (email, bình luận)

- Giao tiếp đồng bộ: giao tiếp yêu cầu phản hồi tức thời (gọi điện, họp trực tuyến, chat trực tiếp)

- Biên bản họp: văn bản ghi lại nội dung, quyết định và việc cần làm sau cuộc họp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('00f9407d-2941-49c6-9a64-d21a3902ebaf', v_m_m2_i_01, 'M2-I-01-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc chọn phương tiện giao tiếp số cần dựa trên ba yếu tố: độ khẩn (cần trả lời ngay hay có thể chờ), độ phức tạp (câu trả lời đơn giản hay cần thảo luận qua lại), và nhu cầu lưu vết (có cần bằng chứng văn bản không).

Một email đạt mục đích trong một lần gửi cần nêu rõ ngay từ đầu: mục đích của email, thông tin cần thiết để người nhận hiểu bối cảnh, và hành động cụ thể mong muốn kèm thời hạn. Với email từ chối, nên nêu quyết định rõ ràng trước, sau đó mới giải thích lý do.

Khi điều hành họp trực tuyến, cần có chương trình họp gửi trước, phân công người ghi biên bản, và kết thúc bằng việc tóm tắt quyết định cùng việc cần làm cho từng người. Khi làm việc với người ở múi giờ khác, nên ưu tiên giao tiếp bất đồng bộ và ghi rõ thời hạn phản hồi mong muốn.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('68b6bd60-a9ee-4a61-87ba-3a6f169bad7c', v_m_m2_i_01, 'M2-I-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Viết ba email khó: từ chối yêu cầu của cấp trên, thúc tiến độ đối tác, và thông báo tin không tốt cho khách hàng. Với mỗi email, nêu rõ mục tiêu và lý do chọn cách viết như vậy.

Sản phẩm nộp: 3 email kèm giải trình chiến lược giao tiếp.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('574ad993-8ac2-4097-a5f9-eaa3857b46a5', v_m_m2_i_01, 'M2-I-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Việc nào nên dùng kênh giao tiếp đồng bộ (họp, gọi điện)? A. Thông báo lịch nghỉ lễ B. Thảo luận phức tạp cần trao đổi qua lại C. Gửi tài liệu tham khảo D. Nhắc lịch hẹn Đáp án: B — Giao tiếp đồng bộ phù hợp cho nội dung cần thảo luận trực tiếp.

2. Email từ chối nên bắt đầu bằng gì? A. Lời xin lỗi dài dòng B. Nêu quyết định rõ ràng trước, sau đó giải thích C. Kể chuyện dẫn dắt D. Không cần cấu trúc rõ ràng Đáp án: B — Nêu rõ quyết định trước giúp người đọc không mất kiên nhẫn chờ đợi.

3. Khi làm việc với người ở múi giờ khác, nên làm gì? A. Yêu cầu phản hồi tức thời B. Ưu tiên giao tiếp bất đồng bộ, ghi rõ thời hạn mong muốn C. Chỉ liên lạc khi cùng múi giờ D. Không cần điều chỉnh gì Đáp án: B — Giao tiếp bất đồng bộ phù hợp hơn khi có chênh lệch múi giờ.

4. Khi nào nên chuyển từ chat sang gọi điện để giải quyết bất đồng? A. Ngay từ tin nhắn đầu tiên B. Sau hai đến ba lượt trao đổi chưa thống nhất được C. Không bao giờ cần chuyển D. Chỉ khi được yêu cầu Đáp án: B — Văn bản dễ hiểu sai giọng điệu; chuyển kênh sớm giúp tránh kéo dài tranh luận.

5. Một cuộc họp trực tuyến hiệu quả nên kết thúc bằng gì? A. Kết thúc đột ngột không tổng kết B. Tóm tắt quyết định và việc cần làm cho từng người C. Chỉ chào tạm biệt D. Không cần kết luận gì Đáp án: B — Tóm tắt cuối họp đảm bảo mọi người hiểu rõ hành động tiếp theo.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('cb33eda2-38e4-4d7a-a8ff-39ec5dfb526d', v_m_m2_i_02, 'M2-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Vận dụng được các công nghệ số phù hợp để chia sẻ dữ liệu, thông tin và nội dung số

- Giải thích được cách đóng vai trò trung gian để chia sẻ thông tin và nội dung

- Áp dụng được các phương pháp tham chiếu và ghi chú nguồn', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d14dba60-a4de-4a0b-b447-cb5e5e795fee', v_m_m2_i_02, 'M2-I-02-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Phân loại thông tin: việc gán một tài liệu vào một trong các mức nhạy cảm để xác định cách xử lý phù hợp

- Bốn mức phân loại phổ biến: công khai, nội bộ, hạn chế, mật', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7b72e875-78a7-424e-93ef-2eda622dfb89', v_m_m2_i_02, 'M2-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc chia sẻ thông tin và nội dung số cần thêm vai trò đóng làm người trung gian — lựa chọn công nghệ số phù hợp để trao đổi dữ liệu, đồng thời hiểu biết về thực hành trích dẫn và ghi chú nguồn khi chia sẻ nội dung không phải do mình tạo ra.

Bốn mức phân loại thông tin giúp xác định cách chia sẻ phù hợp: công khai (ai cũng xem được), nội bộ (chỉ nhân viên công ty), hạn chế (chỉ nhóm/bộ phận liên quan), mật (chỉ người được chỉ định cụ thể). Thông tin mật không bao giờ dùng liên kết chia sẻ mở, luôn chỉ định người nhận cụ thể.

Quyền truy cập cần được rà soát định kỳ, đặc biệt khi có nhân sự nghỉ việc hoặc chuyển vị trí. Khi phát hiện đã chia sẻ nhầm thông tin nhạy cảm, cần thu hồi quyền truy cập ngay lập tức.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('cfefcb60-bab6-4ace-b3bb-9519cd059618', v_m_m2_i_02, 'M2-I-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Phân loại 10 loại tài liệu của doanh nghiệp theo bốn mức, thiết lập quyền tương ứng cho từng mức và lập lịch rà soát.

Sản phẩm nộp: Bảng phân loại tài liệu, bảng quyền, lịch rà soát.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('31f9874e-2e6f-4885-a45b-83e18afaa334', v_m_m2_i_02, 'M2-I-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Thông tin mật nên được chia sẻ như thế nào? A. Bằng liên kết mở cho tiện lợi B. Chỉ định người nhận cụ thể, có thể giới hạn thời hạn và quyền tải xuống C. Đăng công khai để minh bạch D. Gửi cho toàn công ty Đáp án: B — Thông tin mật cần kiểm soát chặt chẽ về người nhận và thời hạn.

2. Vì sao cần rà soát quyền truy cập định kỳ? A. Không cần thiết nếu không có sự cố B. Quyền cũ không tự động mất khi nhân sự nghỉ việc hoặc chuyển vị trí C. Chỉ để kiểm tra dung lượng D. Theo yêu cầu ngẫu nhiên Đáp án: B — Quyền truy cập tồn tại cho đến khi bị chủ động thu hồi.

3. Khi phát hiện chia sẻ nhầm thông tin nhạy cảm, bước đầu tiên nên làm là gì? A. Im lặng chờ xem có ai phát hiện không B. Thu hồi quyền truy cập ngay lập tức C. Xóa toàn bộ tài liệu D. Đợi cuối tuần mới xử lý Đáp án: B — Thu hồi quyền ngay giúp hạn chế phạm vi ảnh hưởng.

4. Bốn mức phân loại thông tin phổ biến là gì? A. Cao, trung bình, thấp, không có B. Công khai, nội bộ, hạn chế, mật C. Quan trọng, không quan trọng D. Mới, cũ Đáp án: B — Đây là bốn mức phân loại phổ biến trong quản lý thông tin doanh nghiệp.

5. Thông tin “nội bộ” nghĩa là gì? A. Chỉ một người được xem B. Chỉ nhân viên công ty được xem, không chia sẻ ra ngoài C. Ai cũng có thể xem D. Chỉ ban giám đốc được xem Đáp án: B — Nội bộ là mức dành cho nhân viên trong công ty, không công khai ra ngoài.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6bcc573e-8d57-4121-9bc0-dc2b0e4645ce', v_m_m2_i_03, 'M2-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Lựa chọn được các dịch vụ số để tham gia vào xã hội

- Thảo luận về các công nghệ số phù hợp để nâng cao năng lực của bản thân và tham gia vào xã hội với tư cách là một công dân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5bd551f5-ddf8-4257-9afd-e1d028d83739', v_m_m2_i_03, 'M2-I-03-02', 'Định nghĩa', 'TEXT', '- Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số

- Hóa đơn điện tử: hóa đơn được lập, gửi và lưu trữ dưới dạng dữ liệu điện tử, có giá trị pháp lý như hóa đơn giấy

- Mã số hồ sơ: mã định danh dùng để tra cứu trạng thái xử lý của một hồ sơ đã nộp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d81c68a4-ec0f-4d7c-b226-2eafd85963c4', v_m_m2_i_03, 'M2-I-03-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc sử dụng dịch vụ số để tham gia xã hội mở rộng sang phạm vi công việc — thực hiện thủ tục hành chính trực tuyến cho doanh nghiệp như khai thuế, đóng bảo hiểm xã hội, đăng ký thay đổi thông tin doanh nghiệp.

Mỗi thủ tục thường yêu cầu chữ ký số để xác nhận tính hợp lệ của hồ sơ. Hóa đơn điện tử đã thay thế phần lớn hóa đơn giấy trong giao dịch doanh nghiệp. Sau khi nộp hồ sơ trực tuyến, nên lưu lại mã số hồ sơ để theo dõi trạng thái xử lý.

Lừa đảo mạo danh cơ quan thuế, bảo hiểm xã hội là hình thức phổ biến — cách xác minh là luôn kiểm tra lại qua kênh chính thức thay vì làm theo hướng dẫn trong tin nhắn/cuộc gọi đáng ngờ.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e2ae3b76-3490-464f-b844-7a6fc6b99dfc', v_m_m2_i_03, 'M2-I-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Lập quy trình chi tiết cho một thủ tục trực tuyến mà bộ phận thường xuyên thực hiện, kèm danh mục hồ sơ cần có và các điểm dễ sai sót.

Sản phẩm nộp: Quy trình thủ tục dạng các bước và danh mục kiểm tra.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('af9be259-1fb6-46d7-8bb7-3a78d53da321', v_m_m2_i_03, 'M2-I-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Chữ ký số dùng để làm gì trong thủ tục hành chính trực tuyến? A. Trang trí hồ sơ B. Xác nhận tính hợp lệ của hồ sơ, thay thế chữ ký tay C. Tăng tốc độ xử lý D. Không có tác dụng thực tế Đáp án: B — Chữ ký số xác thực tính hợp lệ và có giá trị pháp lý.

2. Sau khi nộp hồ sơ trực tuyến, nên lưu lại gì để theo dõi? A. Không cần lưu gì B. Mã số hồ sơ C. Ảnh chụp màn hình bất kỳ D. Không cần thiết vì hệ thống tự động thông báo Đáp án: B — Mã số hồ sơ là căn cứ để tra cứu trạng thái xử lý.

3. Nhận được tin nhắn yêu cầu “nộp phạt gấp” mạo danh cơ quan thuế, nên làm gì? A. Chuyển tiền ngay theo hướng dẫn B. Xác minh lại qua kênh chính thức trước khi hành động C. Xóa tin nhắn và không làm gì D. Trả lời tin nhắn để hỏi thêm Đáp án: B — Luôn xác minh qua kênh chính thức trước khi thực hiện bất kỳ yêu cầu tài chính nào.

4. Hóa đơn điện tử có giá trị pháp lý như thế nào so với hóa đơn giấy? A. Không có giá trị pháp lý B. Có giá trị pháp lý tương đương C. Chỉ có giá trị tham khảo D. Chỉ dùng nội bộ Đáp án: B — Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy theo quy định.

5. Khi hồ sơ bị trả về do thiếu sót, nên làm gì? A. Nộp lại từ đầu hoàn toàn mới B. Xử lý theo đúng hướng dẫn trong thông báo C. Bỏ qua và nộp lại y hệt D. Liên hệ người quen để “chạy” hồ sơ Đáp án: B — Xử lý đúng theo hướng dẫn cụ thể trong thông báo trả hồ sơ là cách hiệu quả nhất.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7492a267-3b89-40c5-8da7-ddb48aa835f5', v_m_m2_i_04, 'M2-I-04-01', 'Mục tiêu học tập', 'TEXT', '- Lựa chọn được các công cụ và công nghệ số cho các quá trình hợp tác', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e3f5d91b-0df0-40c9-9a71-0efa155fa51b', v_m_m2_i_04, 'M2-I-04-02', 'Định nghĩa', 'TEXT', '- Quy ước nhóm (team norms): các thỏa thuận chung về cách thức làm việc, kênh giao tiếp, thời gian phản hồi trong nhóm

- Vi quản lý (micromanagement): việc kiểm soát quá chi tiết công việc của người khác, gây cản trở thay vì hỗ trợ', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('645e0138-0f1f-4b10-9b01-db7d3fc1f74f', v_m_m2_i_04, 'M2-I-04-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc hợp tác qua công nghệ số cần lựa chọn công cụ phù hợp một cách có chủ đích hơn cho từng quy trình cụ thể của nhóm, không chỉ dùng công cụ mặc định.

Khi phân công công việc, cần nói rõ ba điều: ai làm, làm xong khi nào, và thế nào được coi là hoàn thành. Theo dõi tiến độ nên dựa trên cập nhật trạng thái trên bảng công việc, tránh việc liên tục hỏi han trực tiếp gây cảm giác bị vi quản lý.

Quy ước nhóm nên xác định rõ: kênh nào dùng cho loại việc gì, thời gian phản hồi kỳ vọng là bao lâu. Khi bàn giao công việc, cần có tài liệu bàn giao rõ ràng thay vì trao đổi miệng.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('637131f2-80b1-417a-ac2e-d3fe9ebfa418', v_m_m2_i_04, 'M2-I-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Thiết lập không gian làm việc cho một dự án thật của bộ phận: bảng công việc, cấu trúc tài liệu, và quy ước nhóm bằng văn bản.

Sản phẩm nộp: Không gian làm việc nhóm và bản quy ước nhóm.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0e786edd-4ceb-4b84-ba91-a875e923b996', v_m_m2_i_04, 'M2-I-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khi phân công công việc, ba điều cần nói rõ là gì? A. Ai làm, ở đâu, khi nào B. Ai làm, làm xong khi nào, thế nào là hoàn thành C. Ai làm, làm gì, tại sao D. Không cần nói rõ gì Đáp án: B — Thiếu tiêu chí “thế nào là xong” thường gây tranh cãi về chất lượng sau này.

2. Vi quản lý là gì? A. Quản lý một nhóm nhỏ B. Kiểm soát quá chi tiết công việc người khác, gây cản trở C. Quản lý từ xa D. Không giao việc cho ai Đáp án: B — Đây là hành vi kiểm soát thái quá, phản tác dụng.

3. Cách tốt để theo dõi tiến độ mà không gây cảm giác vi quản lý là gì? A. Hỏi han liên tục trực tiếp B. Dựa trên cập nhật trạng thái trên bảng công việc C. Không theo dõi gì cả D. Yêu cầu báo cáo mỗi giờ Đáp án: B — Cập nhật trạng thái minh bạch giúp theo dõi mà không cần giám sát trực tiếp liên tục.

4. Quy ước nhóm nên bao gồm nội dung gì? A. Chỉ cần tên các thành viên B. Kênh nào dùng cho việc gì, thời gian phản hồi kỳ vọng C. Không cần thiết lập quy ước D. Chỉ áp dụng cho nhóm lớn Đáp án: B — Đây là những nội dung cốt lõi giúp nhóm làm việc hiệu quả và nhất quán.

5. Khi bàn giao công việc, nên làm gì? A. Trao đổi miệng là đủ B. Có tài liệu bàn giao rõ ràng bằng văn bản C. Không cần bàn giao nếu công việc đơn giản D. Chỉ cần gửi email ngắn gọn “bàn giao xong” Đáp án: B — Tài liệu bàn giao rõ ràng giúp người tiếp nhận nắm được đầy đủ thông tin cần thiết.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c35727f2-80cf-47f3-b386-876483bc9253', v_m_m2_i_05, 'M2-I-05-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận về các chuẩn mực hành vi và cách sử dụng công nghệ số và tương tác trong môi trường số

- Thảo luận các chiến lược giao tiếp phù hợp trong môi trường số

- Thảo luận các khía cạnh đa dạng về văn hóa và thế hệ cần xem xét trong môi trường số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('38dc26dd-ed6d-4a0b-9a60-1ce60a811988', v_m_m2_i_05, 'M2-I-05-02', 'Định nghĩa', 'TEXT', '- Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến

- Giao tiếp trực tiếp/gián tiếp: phong cách nói thẳng vấn đề (trực tiếp) so với diễn đạt vòng vo, ngụ ý (gián tiếp), khác nhau tùy văn hóa

- Vai trò người chứng kiến (bystander): người nhìn thấy hành vi không phù hợp nhưng không phải là người bị ảnh hưởng trực tiếp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('31c8f289-2519-41b1-9419-f1f95d500c16', v_m_m2_i_05, 'M2-I-05-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc thực hiện nghi thức số cần mở rộng sang bối cảnh đa văn hóa và tình huống khó xử lý hơn. Khi giao tiếp với đối tác nước ngoài, cần lưu ý sự khác biệt văn hóa về mức độ trực tiếp trong cách nói, thái độ với thứ bậc, và kỳ vọng về thời gian phản hồi.

Khi khách hàng để lại phản hồi tiêu cực trên kênh công khai, nguyên tắc xử lý là phản hồi công khai một cách chuyên nghiệp và mời chuyển sang kênh riêng để giải quyết chi tiết.

Trong nhóm chat công việc, nếu phát hiện hành vi bắt nạt trên mạng, loại trừ hoặc quấy rối, người chứng kiến có vai trò quan trọng — có thể lên tiếng trực tiếp hoặc báo cáo cho người quản lý. Xây quy tắc ứng xử số cho bộ phận giúp thiết lập chuẩn mực chung.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('75c67faa-6d9b-4b2f-9475-59895444f75e', v_m_m2_i_05, 'M2-I-05-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Soạn phản hồi công khai cho một đánh giá tiêu cực của khách hàng, và soạn dự thảo quy tắc ứng xử số 1 trang cho bộ phận.

Sản phẩm nộp: Bản phản hồi khách hàng và dự thảo quy tắc ứng xử.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('56604c80-ba7a-4d22-a2c3-a6332151103f', v_m_m2_i_05, 'M2-I-05-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khi khách hàng để lại phản hồi tiêu cực công khai, nên làm gì? A. Tranh luận công khai để bảo vệ danh dự công ty B. Phản hồi chuyên nghiệp, mời chuyển sang kênh riêng để giải quyết C. Xóa bình luận ngay lập tức D. Phớt lờ hoàn toàn Đáp án: B — Phản hồi chuyên nghiệp và chuyển sang kênh riêng giúp giải quyết hiệu quả mà không leo thang công khai.

2. Vai trò của người chứng kiến khi thấy hành vi bắt nạt trong nhóm chat là gì? A. Không có vai trò gì vì không bị ảnh hưởng trực tiếp B. Có thể lên tiếng hoặc báo cáo cho người quản lý C. Chỉ nên xem và không làm gì D. Rời khỏi nhóm ngay Đáp án: B — Người chứng kiến có thể đóng vai trò quan trọng trong việc ngăn chặn hành vi không phù hợp.

3. Khi giao tiếp với đối tác từ văn hóa coi trọng cách nói gián tiếp, nên lưu ý gì? A. Nói thẳng mọi vấn đề không cần cân nhắc B. Chú ý cách diễn đạt tế nhị hơn, hiểu ý ngụ ý C. Không cần điều chỉnh gì D. Luôn dùng văn phong trang trọng nhất Đáp án: B — Cần điều chỉnh cách diễn đạt phù hợp với phong cách giao tiếp của đối tác.

4. Quy tắc ứng xử số cho bộ phận nên bao gồm nội dung gì? A. Chỉ cần danh sách thành viên B. Giờ giấc nhắn tin, cách xử lý bất đồng, quy trình khi có vi phạm C. Không cần thiết lập D. Chỉ áp dụng cho nhân viên mới Đáp án: B — Đây là các nội dung cốt lõi để thiết lập chuẩn mực chung cho bộ phận.

5. Kỳ vọng về thời gian phản hồi có giống nhau giữa các nền văn hóa không? A. Luôn giống nhau ở mọi nơi B. Khác nhau tùy văn hóa, cần tìm hiểu trước khi làm việc với đối tác C. Không quan trọng D. Chỉ phụ thuộc vào cấp bậc Đáp án: B — Kỳ vọng phản hồi khác nhau tùy văn hóa, cần lưu ý khi làm việc xuyên quốc gia.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e05dd15f-cfef-4b52-a271-27871f6853dc', v_m_m2_i_06, 'M2-I-06-01', 'Mục tiêu học tập', 'TEXT', '- Hiển thị được nhiều danh tính số cụ thể

- Thảo luận những cách cụ thể để bảo vệ danh tiếng trực tuyến của bản thân

- Thao tác dữ liệu cá nhân tạo ra thông qua các công cụ, môi trường hoặc dịch vụ số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2650d164-5c8d-47dd-878b-9343b5a3dee7', v_m_m2_i_06, 'M2-I-06-02', 'Định nghĩa', 'TEXT', '- Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác

- Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến

- Hồ sơ nghề nghiệp trực tuyến: thông tin về quá trình làm việc, kỹ năng, thành tích được thể hiện công khai trên môi trường số

- Phát ngôn nhân danh doanh nghiệp: phát biểu được hiểu là đại diện cho quan điểm chính thức của tổ chức, không chỉ là ý kiến cá nhân', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ad2a103c-8a3f-416d-9894-f81e6cc71f45', v_m_m2_i_06, 'M2-I-06-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc quản lý danh tính số mở rộng sang hình ảnh nghề nghiệp — xây dựng hồ sơ nghề nghiệp trực tuyến nhất quán tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn.

Ranh giới giữa phát ngôn cá nhân và phát ngôn nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ cá nhân có ghi rõ nơi làm việc — một bình luận về ngành nghề, dù với ý định cá nhân, có thể bị hiểu là quan điểm của công ty.

Khi quản lý nhiều tài khoản, cần có quy tắc rõ ràng để tránh đăng nhầm nội dung. Rà soát nội dung cũ định kỳ giúp phát hiện những bài đăng không còn phù hợp, ảnh hưởng đến danh tiếng trực tuyến hiện tại.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ab7da9fd-468b-4a66-adc5-9c665fd4a829', v_m_m2_i_06, 'M2-I-06-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Rà soát toàn bộ hiện diện trực tuyến của bản thân, lập danh sách nội dung cần điều chỉnh, và cập nhật hồ sơ nghề nghiệp chính.

Sản phẩm nộp: Báo cáo rà soát danh tính số và hồ sơ nghề nghiệp đã cập nhật.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('85976471-9343-4dce-8dd9-ce0c4c4ec8b8', v_m_m2_i_06, 'M2-I-06-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao một hồ sơ nghề nghiệp trực tuyến nhất quán lại quan trọng? A. Không quan trọng B. Tạo ấn tượng đáng tin cậy hơn so với thông tin rời rạc, mâu thuẫn C. Chỉ để trang trí D. Không ảnh hưởng đến công việc Đáp án: B — Tính nhất quán tạo dựng uy tín và sự chuyên nghiệp.

2. Một bình luận cá nhân về đối thủ cạnh tranh trên mạng xã hội có rủi ro gì? A. Không có rủi ro vì là ý kiến cá nhân B. Có thể bị hiểu là quan điểm của công ty, gây rủi ro uy tín hoặc pháp lý C. Luôn được khuyến khích D. Chỉ có vấn đề nếu đăng công khai Đáp án: B — Ranh giới cá nhân và nhân danh công ty không phải lúc nào cũng rõ ràng, đặc biệt khi hồ sơ có ghi nơi làm việc.

3. Vì sao nên rà soát nội dung cũ trên mạng xã hội định kỳ? A. Không cần thiết B. Phát hiện nội dung không còn phù hợp với hình ảnh nghề nghiệp hiện tại C. Chỉ để tăng lượt theo dõi D. Không có lý do cụ thể Đáp án: B — Nội dung cũ có thể không còn phù hợp và ảnh hưởng đến hình ảnh hiện tại.

4. Khi quản lý nhiều tài khoản (cá nhân, công việc), cần lưu ý điều gì? A. Không cần phân biệt gì B. Có quy tắc rõ ràng để tránh đăng nhầm nội dung vào sai tài khoản C. Dùng chung một mật khẩu cho tiện D. Không cần nhiều tài khoản Đáp án: B — Quy tắc rõ ràng giúp tránh sai sót gây ảnh hưởng không mong muốn.

5. Quyền yêu cầu gỡ bỏ thông tin cá nhân tồn tại nhằm mục đích gì? A. Không có mục đích cụ thể B. Cho phép cá nhân kiểm soát thông tin của mình trên một số nền tảng trong trường hợp nhất định C. Chỉ áp dụng cho người nổi tiếng D. Không có quyền này trong thực tế Đáp án: B — Đây là một quyền được quy định nhằm bảo vệ quyền kiểm soát thông tin cá nhân.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9298d328-430e-43d3-a7d2-b1a3d3285b8f', v_m_m2_a_01, 'M2-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Thích nghi được với nhiều công nghệ số để có sự tương tác phù hợp nhất

- Thích nghi được các phương tiện giao tiếp phù hợp nhất cho một bối cảnh cụ thể', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('750603a7-abca-4741-be73-cc8bcc175031', v_m_m2_a_01, 'M2-A-01-02', 'Định nghĩa', 'TEXT', '- Phương tiện giao tiếp số (Điều 2, TT 02/2025/TT-BGDĐT): các nền tảng, công cụ và nội dung được tạo ra, lưu trữ, phân phối và truy cập thông qua công nghệ số, bao gồm mạng Internet, mạng xã hội, ứng dụng di động, các thiết bị điện tử

- Kiến trúc kênh giao tiếp: hệ thống các kênh được xác định rõ mục đích sử dụng cho từng loại thông điệp trong tổ chức

- Phân tầng thông điệp: việc điều chỉnh cùng một nội dung theo cách phù hợp với từng nhóm đối tượng khác nhau', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('905d0f2d-77b1-4238-a457-acee8495f124', v_m_m2_a_01, 'M2-A-01-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc thích nghi công nghệ số và phương tiện giao tiếp không còn chỉ ở phạm vi cá nhân mà mở rộng ra cấp tổ chức. Cần thiết kế kiến trúc kênh giao tiếp cho cả tổ chức: xác định rõ kênh nào dùng cho loại thông điệp nào — thông báo chính thức toàn công ty, trao đổi công việc hàng ngày, phản hồi khẩn cấp.

Khi truyền đạt một thay đổi lớn, trình tự thông báo cần được lên kế hoạch: thông báo cho quản lý trực tiếp trước, sau đó đến toàn thể nhân viên liên quan, tránh để nhân viên nghe tin qua kênh không chính thức trước.

Cùng một thông điệp có thể cần trình bày khác nhau cho các nhóm đối tượng khác nhau. Đo lường hiệu quả giao tiếp nội bộ có thể qua tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('29c13cbc-468c-493e-923b-b4507a8e77a2', v_m_m2_a_01, 'M2-A-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây kế hoạch truyền thông nội bộ cho một thay đổi lớn trong doanh nghiệp (đổi quy trình, sáp nhập bộ phận, hoặc triển khai hệ thống mới), gồm kênh sử dụng, trình tự thông báo, và thông điệp riêng cho từng nhóm đối tượng.

Sản phẩm nộp: Kế hoạch truyền thông thay đổi.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0a80b226-5b32-4022-b66a-8eca9950d471', v_m_m2_a_01, 'M2-A-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cần có trình tự thông báo rõ ràng khi truyền đạt thay đổi lớn? A. Không quan trọng, thông báo đồng thời là đủ B. Tránh nhân viên nghe tin qua kênh không chính thức trước, gây tin đồn C. Chỉ để tiết kiệm thời gian D. Không có lý do cụ thể Đáp án: B — Trình tự hợp lý giúp kiểm soát thông tin và tránh mất lòng tin.

2. Vì sao cùng một thông điệp cần trình bày khác nhau cho các nhóm đối tượng khác nhau? A. Không cần thiết, nội dung giống nhau là đủ B. Mỗi nhóm cần loại thông tin và mức độ chi tiết khác nhau để hiểu và hành động đúng C. Chỉ để tạo sự khác biệt D. Không có lý do thực tế Đáp án: B — Phân tầng thông điệp giúp mỗi nhóm nhận được thông tin phù hợp với vai trò của họ.

3. Dấu hiệu quá tải giao tiếp trong tổ chức bao gồm gì? A. Không có cuộc họp nào B. Quá nhiều cuộc họp không cần thiết, thông báo dồn dập ngoài giờ C. Giao tiếp quá ít D. Không có dấu hiệu cụ thể Đáp án: B — Đây là các dấu hiệu phổ biến của quá tải giao tiếp trong tổ chức.

4. Đo lường hiệu quả giao tiếp nội bộ nên dựa vào điều gì? A. Chỉ cảm nhận chủ quan B. Tỷ lệ đọc/mở thông báo và khảo sát mức độ hiểu đúng thông điệp C. Số lượng email gửi đi D. Không cần đo lường Đáp án: B — Dữ liệu định lượng cho phép đánh giá khách quan hơn cảm nhận chủ quan.

5. Kiến trúc kênh giao tiếp trong tổ chức nhằm mục đích gì? A. Tăng số lượng kênh sử dụng B. Xác định rõ kênh nào dùng cho loại thông điệp nào, tránh lẫn lộn thông tin quan trọng C. Không có mục đích cụ thể D. Chỉ để trang trí hệ thống Đáp án: B — Kiến trúc rõ ràng giúp thông tin quan trọng không bị chìm trong khối lượng lớn tin nhắn không quan trọng.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9b511c3f-4a03-41bf-b210-bbc7ea08bd7b', v_m_m2_a_02, 'M2-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá được các công nghệ số phù hợp nhất để chia sẻ thông tin và nội dung

- Thích ứng được vai trò trung gian của mình

- Thay đổi được cách sử dụng các phương pháp tham chiếu và ghi chú phù hợp hơn', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('84b93716-651a-4d05-a23e-8df7be09a3a8', v_m_m2_a_02, 'M2-A-02-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Phân quyền theo vai trò (role-based access): cấp quyền truy cập dựa trên chức năng công việc của một vai trò, thay vì cấp riêng lẻ cho từng cá nhân

- Phân tách nhiệm vụ: nguyên tắc không để một người kiểm soát toàn bộ một quy trình nhạy cảm từ đầu đến cuối', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('02a26605-f553-4706-b9ec-3cdd18cd5832', v_m_m2_a_02, 'M2-A-02-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc chia sẻ thông tin và nội dung số đòi hỏi đánh giá công nghệ số phù hợp nhất và thích ứng vai trò trung gian của mình trong bối cảnh phức tạp — tức là xây dựng chính sách chia sẻ thông tin cấp tổ chức, không còn là quyết định cá nhân từng lần.

Chính sách này cần nêu rõ nguyên tắc chung, phạm vi áp dụng, và ngoại lệ được phép. Nên phân quyền theo vai trò (ai giữ vai trò nào sẽ có quyền tương ứng) thay vì cấp quyền riêng lẻ cho từng người, kèm nguyên tắc quyền tối thiểu và phân tách nhiệm vụ cho quy trình có rủi ro cao.

Quy trình ứng phó sự cố lộ dữ liệu cần được viết sẵn theo năm bước: khoanh vùng, đánh giá, thông báo, khắc phục, rà soát.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fea717eb-7717-47bc-acfc-076bad37f65f', v_m_m2_a_02, 'M2-A-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây mô hình phân quyền theo vai trò cho doanh nghiệp (tối thiểu bốn vai trò × năm nhóm dữ liệu), một sổ rủi ro sáu mục, và một quy trình ứng phó sự cố.

Sản phẩm nộp: Ma trận phân quyền, sổ rủi ro, quy trình ứng phó.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fcad0123-cce8-493a-8736-57387962efe9', v_m_m2_a_02, 'M2-A-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Phân quyền theo vai trò có ưu điểm gì so với cấp quyền cá nhân? A. Không có ưu điểm gì B. Dễ quản lý hơn, không phụ thuộc vào việc nhớ cấp quyền cho từng người C. Chậm hơn D. Tốn nhiều tài nguyên hơn Đáp án: B — Phân quyền theo vai trò tự động và nhất quán hơn khi số lượng nhân sự tăng.

2. Phân tách nhiệm vụ nhằm mục đích gì? A. Tăng khối lượng công việc B. Đảm bảo không ai một mình kiểm soát toàn bộ quy trình nhạy cảm C. Giảm số người tham gia công việc D. Không có mục đích cụ thể Đáp án: B — Đây là biện pháp kiểm soát rủi ro trong các quy trình nhạy cảm.

3. Bước đầu tiên trong quy trình ứng phó sự cố lộ dữ liệu là gì? A. Thông báo ngay cho cơ quan quản lý B. Khoanh vùng để ngăn chặn lan rộng C. Tìm người chịu trách nhiệm D. Viết báo cáo chi tiết Đáp án: B — Khoanh vùng ngay lập tức giúp hạn chế phạm vi thiệt hại trước khi thực hiện các bước tiếp theo.

4. Khi chia sẻ thông tin với bên thứ ba, cần có gì? A. Không cần ràng buộc gì đặc biệt B. Ràng buộc hợp đồng rõ ràng về cách sử dụng và bảo vệ thông tin C. Chỉ cần thỏa thuận miệng D. Chỉ cần gửi email xác nhận Đáp án: B — Ràng buộc hợp đồng bảo vệ tổ chức khi thông tin được chia sẻ ra bên ngoài.

5. Sổ rủi ro thông tin nên bao gồm những gì? A. Chỉ cần liệt kê tên rủi ro B. Rủi ro, khả năng xảy ra, mức tác động, biện pháp giảm thiểu, người chịu trách nhiệm C. Chỉ cần ngày phát hiện D. Không cần lập sổ rủi ro Đáp án: B — Đây là các thành phần cần thiết để sổ rủi ro thực sự hữu ích cho quản lý.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b3e28e83-503d-44ba-b7b5-ebcbdd64c7f2', v_m_m2_a_03, 'M2-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Thay đổi được việc sử dụng các dịch vụ số phù hợp nhất để tham gia vào xã hội

- Thay đổi được cách sử dụng các công nghệ số phù hợp nhất để nâng cao năng lực cho bản thân và tham gia vào xã hội với tư cách là một công dân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('4079d529-17b7-428b-b656-bd2071e2daec', v_m_m2_a_03, 'M2-A-03-02', 'Định nghĩa', 'TEXT', '- Dịch vụ số (Điều 2, TT 02/2025/TT-BGDĐT): các dịch vụ được cung cấp thông qua phương tiện giao tiếp số

- Nghĩa vụ tuân thủ số: các yêu cầu pháp lý liên quan đến hoạt động số mà doanh nghiệp phải thực hiện (khai báo, báo cáo, lưu trữ)

- Đánh giá tác động quy định: quá trình phân tích một quy định mới sẽ ảnh hưởng thế nào đến hoạt động và quy trình hiện tại của doanh nghiệp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f67ac80b-0525-438c-978d-b6e551f9af74', v_m_m2_a_03, 'M2-A-03-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc tham gia xã hội qua công nghệ số mở rộng thành trách nhiệm của cả doanh nghiệp trong môi trường số công cộng — cần lập bản đồ nghĩa vụ số của doanh nghiệp theo lĩnh vực hoạt động và theo dõi thay đổi quy định từ nguồn cập nhật chính thức.

Xây dựng quy trình chuẩn cho giao dịch với cơ quan quản lý giúp đảm bảo tính nhất quán: ai chịu trách nhiệm chuẩn bị hồ sơ, ai phê duyệt trước khi nộp, lưu trữ hồ sơ ở đâu để phục vụ thanh kiểm tra.

Khi có quy định mới, cần đánh giá tác động: quy trình nào cần thay đổi, hệ thống nào cần cập nhật, nhân sự nào cần được đào tạo lại.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('01ab4477-2161-4d6b-8df9-1553b61790fe', v_m_m2_a_03, 'M2-A-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Lập bản đồ nghĩa vụ số của doanh nghiệp, xác định ba rủi ro tuân thủ lớn nhất và đề xuất biện pháp.

Sản phẩm nộp: Bản đồ nghĩa vụ tuân thủ và đánh giá rủi ro.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('401ee4a7-448a-42b6-863b-ec27ec727708', v_m_m2_a_03, 'M2-A-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cần lập bản đồ đầy đủ các nghĩa vụ tuân thủ số? A. Không cần thiết B. Giúp tránh bỏ sót nghĩa vụ nào đó theo lĩnh vực hoạt động C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Bản đồ đầy đủ giúp đảm bảo doanh nghiệp không bỏ sót nghĩa vụ pháp lý nào.

2. Nguồn cập nhật quy định nên dựa vào đâu? A. Tin đồn trên mạng xã hội B. Cổng thông tin chính thức của cơ quan quản lý C. Ý kiến cá nhân của đồng nghiệp D. Không cần cập nhật thường xuyên Đáp án: B — Nguồn chính thức đảm bảo thông tin chính xác và kịp thời.

3. Khi có quy định mới, bước quan trọng cần làm là gì? A. Bỏ qua cho đến khi bị kiểm tra B. Đánh giá tác động lên quy trình, hệ thống và đào tạo nhân sự C. Chỉ thông báo bằng miệng cho nhân viên D. Đợi cơ quan quản lý nhắc nhở Đáp án: B — Đánh giá tác động sớm giúp doanh nghiệp tuân thủ kịp thời và tránh sai sót.

4. Vì sao cần quy trình chuẩn cho giao dịch với cơ quan quản lý? A. Không cần thiết nếu doanh nghiệp nhỏ B. Đảm bảo tính nhất quán, giảm rủi ro sai sót C. Chỉ để tạo thủ tục rườm rà D. Không có lợi ích cụ thể Đáp án: B — Quy trình chuẩn giúp đảm bảo mọi giao dịch được xử lý đúng cách và nhất quán.

5. Lưu trữ hồ sơ điện tử phục vụ mục đích gì? A. Chỉ để tiết kiệm giấy B. Phục vụ tra cứu và chứng minh tuân thủ khi có thanh kiểm tra C. Không có mục đích cụ thể D. Chỉ cần lưu trong một tháng Đáp án: B — Hồ sơ lưu trữ đầy đủ là bằng chứng quan trọng khi có yêu cầu thanh kiểm tra.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c1286003-cc37-4ff7-b376-7541494a5ad2', v_m_m2_a_04, 'M2-A-04-01', 'Mục tiêu học tập', 'TEXT', '- Thay đổi cách sử dụng các công cụ và công nghệ số phù hợp nhất cho các quy trình hợp tác

- Chọn được các công cụ và công nghệ số thích hợp nhất để cùng xây dựng và tạo ra dữ liệu, tài nguyên và kiến thức', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('87ba91e6-cce9-4c9a-b4ee-f7f6864baace', v_m_m2_a_04, 'M2-A-04-02', 'Định nghĩa', 'TEXT', '- Nhóm phân tán: nhóm làm việc mà các thành viên không cùng một địa điểm, có thể khác múi giờ

- Điểm bàn giao (handoff point): thời điểm công việc chuyển từ người/bộ phận này sang người/bộ phận khác trong một quy trình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('532781f8-2660-4134-9e3d-ac8ec54825ad', v_m_m2_a_04, 'M2-A-04-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc hợp tác qua công nghệ số cần chọn công cụ thích hợp nhất để cùng xây dựng và đồng sáng tạo dữ liệu, tài nguyên và kiến thức ở quy mô nhóm phân tán và liên bộ phận.

Mô hình làm việc cho nhóm phân tán cần cân bằng giữa đồng bộ (họp trực tiếp định kỳ) và bất đồng bộ (phần lớn công việc hàng ngày). Khi thiết kế quy trình liên bộ phận, cần xác định rõ các điểm bàn giao — nơi công việc chuyển từ bộ phận này sang bộ phận khác thường là nơi thông tin dễ bị thất lạc nhất.

Xung đột trong nhóm làm việc từ xa thường xuất phát từ hiểu lầm qua văn bản nhiều hơn là bất đồng thực chất — khi phát hiện dấu hiệu căng thẳng qua chat, nên chủ động chuyển sang gọi video để làm rõ, vì kênh giao tiếp phong phú hơn (thấy được nét mặt, giọng điệu) giúp giảm hiểu lầm nhanh hơn tiếp tục trao đổi qua văn bản.

Xây dựng văn hóa nhóm khi làm việc từ xa đòi hỏi nỗ lực có chủ đích hơn so với làm việc tại văn phòng — vì thiếu sự kết nối tự nhiên như gặp mặt trực tiếp, cần chủ động tạo ra qua các hoạt động kết nối định kỳ. Hiệu quả cộng tác liên bộ phận có thể đo lường qua thời gian hoàn thành các điểm bàn giao và tỷ lệ công việc phải làm lại do hiểu sai — hai chỉ số này phản ánh trực tiếp chất lượng phối hợp giữa các bộ phận.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3d0fe115-1ace-4f1e-946d-a918f3aea346', v_m_m2_a_04, 'M2-A-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Thiết kế lại một quy trình liên bộ phận đang có vấn đề, chỉ ra điểm mất thông tin và đề xuất cơ chế khắc phục.

Sản phẩm nộp: Quy trình liên bộ phận thiết kế lại và phân tích điểm nghẽn.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('eb434a7c-7a6d-4fbe-a91d-0a27c1730ba2', v_m_m2_a_04, 'M2-A-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Điểm bàn giao trong quy trình liên bộ phận thường là nơi gì? A. Nơi công việc luôn suôn sẻ B. Nơi thông tin dễ bị thất lạc hoặc hiểu sai nhất C. Không có ý nghĩa đặc biệt D. Chỉ liên quan đến IT Đáp án: B — Điểm chuyển giao giữa các bộ phận là nơi dễ xảy ra sai sót thông tin nhất.

2. Xung đột trong nhóm làm việc từ xa thường xuất phát từ đâu? A. Luôn từ bất đồng thực chất về công việc B. Thường từ hiểu lầm qua văn bản do thiếu ngữ điệu, cử chỉ C. Không có nguyên nhân cụ thể D. Chỉ do lỗi kỹ thuật Đáp án: B — Giao tiếp qua văn bản dễ dẫn đến hiểu lầm hơn giao tiếp trực tiếp.

3. Khi phát hiện căng thẳng qua chat, nên làm gì? A. Tiếp tục trao đổi qua chat để có bằng chứng B. Chủ động chuyển sang gọi video để làm rõ C. Phớt lờ và chờ tự hết D. Báo cáo ngay cho cấp trên Đáp án: B — Chuyển kênh giao tiếp phong phú hơn giúp làm rõ và giảm hiểu lầm.

4. Vì sao cần nỗ lực có chủ đích để xây dựng văn hóa nhóm khi làm việc từ xa? A. Không cần thiết vì tự nhiên sẽ hình thành B. Vì thiếu tương tác trực tiếp nên cần các hoạt động kết nối chủ động C. Chỉ cần cho nhóm lớn D. Không có lợi ích rõ ràng Đáp án: B — Kết nối tự nhiên như gặp mặt trực tiếp không có sẵn, cần chủ động tạo ra.

5. Chỉ số nào có thể dùng để đo lường hiệu quả cộng tác liên bộ phận? A. Số lượng email gửi đi B. Thời gian hoàn thành các điểm bàn giao, tỷ lệ làm lại do hiểu sai C. Số cuộc họp tổ chức D. Không thể đo lường được Đáp án: B — Đây là các chỉ số phản ánh trực tiếp chất lượng cộng tác giữa các bộ phận.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('06af8f20-5494-482e-a8d9-53cd722c8262', v_m_m2_a_05, 'M2-A-05-01', 'Mục tiêu học tập', 'TEXT', '- Điều chỉnh các chuẩn mực hành vi và cách phù hợp nhất khi sử dụng công nghệ số và tương tác trong môi trường số

- Điều chỉnh các chiến lược giao tiếp phù hợp nhất trong môi trường số

- Áp dụng được các khía cạnh đa dạng về văn hóa và thế hệ khác nhau trong môi trường số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5c711441-d069-48da-939e-39eb098cccef', v_m_m2_a_05, 'M2-A-05-02', 'Định nghĩa', 'TEXT', '- Nghi thức số (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các quy tắc, chuẩn mực và hành vi ứng xử phù hợp trong môi trường số, bao gồm giao tiếp qua mạng Internet, sử dụng mạng xã hội, email, ứng dụng và các nền tảng trực tuyến

- Khủng hoảng truyền thông: tình huống một sự việc lan truyền nhanh và rộng, gây ảnh hưởng tiêu cực đến uy tín tổ chức

- Ngưỡng leo thang: mức độ nghiêm trọng mà tại đó một vấn đề cần được chuyển lên cấp quản lý cao hơn xử lý', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2980dda5-468c-4a93-8109-d2b2e745fe21', v_m_m2_a_05, 'M2-A-05-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, nghi thức số cần được điều chỉnh phù hợp nhất trong bối cảnh phức tạp — tức là trở thành văn hóa thực hành của cả tổ chức, không chỉ nằm trên văn bản, đòi hỏi sự nhất quán giữa lời nói và hành động của cấp quản lý.

Khi xử lý khủng hoảng truyền thông, 24 giờ đầu tiên là quan trọng nhất: xác nhận sự việc, tránh phản ứng vội vàng, chuẩn bị thông điệp nhất quán. Nguyên tắc phản hồi là thừa nhận vấn đề nếu có, tránh đổ lỗi hoặc bao biện, và tuyệt đối không im lặng hoàn toàn hoặc xóa bằng chứng.

Cơ chế khiếu nại nội bộ cần đảm bảo người khiếu nại được bảo vệ khỏi trả đũa, có kênh báo cáo độc lập với người bị khiếu nại.

Ở mức lãnh đạo, việc áp dụng khía cạnh đa dạng văn hóa và thế hệ không còn dừng ở việc “lưu ý” như mức cơ bản, mà cần chủ động điều chỉnh chính sách ứng xử cho phù hợp với đội ngũ đa dạng — ví dụ khi soạn quy tắc ứng xử số cho một công ty có cả nhân viên Việt Nam và chuyên gia nước ngoài, cần cân nhắc để quy tắc không áp đặt một chuẩn mực văn hóa duy nhất lên mọi người, đồng thời vẫn đảm bảo tính nhất quán. Khi xử lý khủng hoảng truyền thông với đối tượng công chúng đa dạng, thông điệp cũng cần được điều chỉnh cách truyền tải (không phải nội dung cốt lõi) cho phù hợp với từng nhóm văn hóa, thế hệ tiếp nhận.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('00279cfb-b555-40be-b1ad-78ec29a13807', v_m_m2_a_05, 'M2-A-05-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Diễn tập xử lý một khủng hoảng truyền thông: xây kịch bản phản ứng 24 giờ đầu, phân vai xử lý, soạn thông điệp cho từng nhóm đối tượng.

Sản phẩm nộp: Kịch bản ứng phó khủng hoảng và bộ thông điệp.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bda39122-7f65-49ae-b972-e3ba4c43897d', v_m_m2_a_05, 'M2-A-05-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Trong 24 giờ đầu của khủng hoảng truyền thông, điều quan trọng nhất là gì? A. Phản ứng vội vàng để có mặt sớm nhất B. Xác nhận sự việc, chuẩn bị thông điệp nhất quán, tránh phản ứng thiếu thông tin C. Im lặng hoàn toàn D. Xóa mọi bằng chứng liên quan Đáp án: B — Phản ứng có kiểm soát dựa trên thông tin xác thực quan trọng hơn tốc độ.

2. Điều gì KHÔNG nên làm khi xử lý khủng hoảng truyền thông? A. Thừa nhận vấn đề nếu có B. Im lặng hoàn toàn hoặc xóa bằng chứng C. Chuẩn bị thông điệp nhất quán D. Xác nhận sự việc trước khi phản hồi Đáp án: B — Im lặng hoặc xóa bằng chứng thường làm tình hình xấu hơn khi bị phát hiện.

3. Ngưỡng leo thang trong xử lý khủng hoảng dùng để làm gì? A. Xác định khi nào cần chuyển vấn đề lên cấp quản lý cao hơn B. Không có tác dụng thực tế C. Chỉ áp dụng cho vấn đề nhỏ D. Để trì hoãn xử lý Đáp án: A — Phân loại mức độ nghiêm trọng giúp xác định cấp độ xử lý phù hợp.

4. Cơ chế khiếu nại nội bộ cần đảm bảo điều gì? A. Người khiếu nại được bảo vệ khỏi trả đũa B. Chỉ quản lý mới được khiếu nại C. Không cần kênh độc lập D. Khiếu nại phải công khai danh tính ngay từ đầu Đáp án: A — Bảo vệ người khiếu nại là yếu tố then chốt để cơ chế hoạt động hiệu quả.

5. Khi soạn quy tắc ứng xử số cho đội ngũ đa văn hóa, cần lưu ý điều gì? A. Áp đặt một chuẩn mực văn hóa duy nhất cho tất cả B. Điều chỉnh phù hợp với sự đa dạng nhưng vẫn đảm bảo tính nhất quán chung C. Không cần quy tắc chung, mỗi người tự do D. Chỉ áp dụng quy tắc cho nhân viên nước ngoài Đáp án: B — Cần cân bằng giữa tôn trọng đa dạng văn hóa/thế hệ và duy trì tính nhất quán của tổ chức.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('291aba39-2b8e-4aa0-bd94-1e9ef8a6f91c', v_m_m2_a_06, 'M2-A-06-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được nhiều danh tính số

- Giải thích được các cách thích hợp hơn để bảo vệ danh tiếng của bản thân

- Thay đổi được dữ liệu được tạo ra thông qua một số công cụ, môi trường và dịch vụ', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('23b794d2-7d8c-4964-a630-ca10bea45682', v_m_m2_a_06, 'M2-A-06-02', 'Định nghĩa', 'TEXT', '- Danh tính số (Điều 2, TT 02/2025/TT-BGDĐT): tổng hợp thông tin về một người tồn tại ở dạng kỹ thuật số để định danh và phân biệt với những người khác, có thể bao gồm các thông tin như giới tính, tính cách, sở thích, tín ngưỡng, quan điểm chính trị, họ tên, ngày tháng năm sinh, số điện thoại, địa chỉ nhà, địa chỉ thư điện tử và các thông tin cá nhân khác

- Danh tiếng trực tuyến (Điều 2, TT 02/2025/TT-BGDĐT): sự đánh giá hoặc nhận thức của xã hội về giá trị, uy tín, hoặc hình ảnh của một cá nhân, tổ chức hay thương hiệu trên môi trường trực tuyến

- Hiện diện số của doanh nghiệp: tổng thể các kênh và nội dung mà doanh nghiệp xuất hiện trên môi trường số (website, mạng xã hội, đánh giá trực tuyến)

- Uy tín số (digital reputation): nhận thức và đánh giá chung của công chúng về doanh nghiệp trên môi trường số', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('af8b6a53-8cf4-489e-bb1d-10661d3e962d', v_m_m2_a_06, 'M2-A-06-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc quản lý danh tính số mở rộng thành quản lý danh tính số của cả tổ chức — kiểm kê hiện diện số của doanh nghiệp là bước đầu để quản lý: liệt kê toàn bộ kênh chính thức, xác định kênh nào đang hoạt động, kênh nào bị bỏ hoang.

Chính sách phát ngôn cho nhân viên nên xác định rõ ai được phép phát ngôn chính thức thay mặt công ty, ở kênh nào, về chủ đề gì. Mạo danh doanh nghiệp là rủi ro cần được giám sát chủ động — khi phát hiện, cần có quy trình báo cáo tới nền tảng liên quan.

Sự nhất quán về thông tin liên hệ (số điện thoại, địa chỉ, email chính thức) giữa các kênh là một phần quan trọng của hiện diện số đáng tin cậy — khi thông tin liên hệ khác nhau giữa website, mạng xã hội, và các nền tảng khác, khách hàng dễ nghi ngờ đâu là kênh chính thức thật sự, tạo cơ hội cho các kênh mạo danh trà trộn.

Theo dõi danh tiếng trực tuyến có thể qua việc giám sát các đề cập đến thương hiệu trên mạng và phân tích cảm xúc của các đánh giá.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bcb71b50-0c76-418d-89ff-6fdf7cbf74a5', v_m_m2_a_06, 'M2-A-06-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Kiểm kê toàn bộ hiện diện số của doanh nghiệp, phát hiện điểm không nhất quán hoặc rủi ro, và soạn chính sách phát ngôn cho nhân viên.

Sản phẩm nộp: Báo cáo kiểm kê hiện diện số và chính sách phát ngôn.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1445095c-08c3-4a2d-953b-720565438e4a', v_m_m2_a_06, 'M2-A-06-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cần kiểm kê hiện diện số của doanh nghiệp định kỳ? A. Không cần thiết B. Phát hiện kênh bị bỏ hoang có thể là điểm yếu bị lợi dụng C. Chỉ để trang trí báo cáo D. Không có tác dụng thực tế Đáp án: B — Kênh bị bỏ hoang hoặc quên quản lý là rủi ro tiềm ẩn cho danh tính thương hiệu.

2. Chính sách phát ngôn cho nhân viên nhằm mục đích gì? A. Cấm nhân viên nói về công ty B. Xác định rõ ai được phát ngôn chính thức, tránh thông tin mâu thuẫn C. Không có mục đích cụ thể D. Chỉ áp dụng cho quản lý cấp cao Đáp án: B — Chính sách rõ ràng giúp tránh tình trạng thông tin không chính xác lan truyền.

3. Khi phát hiện tài khoản mạo danh doanh nghiệp, nên làm gì? A. Không cần làm gì B. Báo cáo tới nền tảng liên quan và thông báo khách hàng nếu cần C. Chờ khách hàng tự phát hiện D. Chỉ theo dõi mà không hành động Đáp án: B — Xử lý chủ động giúp giảm thiểu thiệt hại từ hành vi mạo danh.

4. Sự thiếu nhất quán thông tin liên hệ giữa các kênh gây ra vấn đề gì? A. Không có vấn đề gì B. Có thể khiến khách hàng nghi ngờ tính xác thực C. Chỉ ảnh hưởng đến thẩm mỹ D. Không liên quan đến uy tín Đáp án: B — Thiếu nhất quán làm giảm độ tin cậy trong mắt khách hàng.

5. Theo dõi uy tín số bao gồm hoạt động nào? A. Chỉ đếm số lượt theo dõi B. Giám sát đề cập thương hiệu, phân tích cảm xúc đánh giá, có kế hoạch phản ứng C. Không cần theo dõi gì D. Chỉ quan tâm khi có khủng hoảng xảy ra Đáp án: B — Theo dõi chủ động giúp phát hiện sớm vấn đề trước khi trở thành khủng hoảng lớn.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f778bc4f-60ea-4b20-9a90-620cedd2001d', v_m_m3_f_01, 'M3-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các cách tạo và chỉnh sửa nội dung đơn giản ở các định dạng đơn giản

- Chọn được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số đơn giản', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('294f0e74-adaf-4392-bb2b-299d9ded27cf', v_m_m3_f_01, 'M3-F-01-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Định dạng văn bản: cách trình bày chữ (tiêu đề, đoạn, danh sách, in đậm) giúp người đọc dễ theo dõi nội dung

- Ô, hàng, cột: đơn vị cơ bản trong bảng tính — ô là giao điểm của một hàng và một cột', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fc9a5f5e-2ef3-41ec-bd0d-91d4f689e60c', v_m_m3_f_01, 'M3-F-01-03', 'Nội dung', 'TEXT', 'Phát triển nội dung số nghĩa là tạo và chỉnh sửa được nội dung số ở các định dạng khác nhau. Định dạng văn bản cơ bản gồm tiêu đề, đoạn, danh sách, in đậm. Bảng tính tổ chức dữ liệu theo ô, hàng và cột. Trình chiếu nên tuân theo nguyên tắc đơn giản: mỗi slide truyền tải một ý chính.

Khi chọn định dạng, cần dựa vào mục đích sử dụng: báo cáo chi tiết dùng văn bản, số liệu cần tính toán dùng bảng tính, thuyết trình dùng trình chiếu. Khi cần gửi tài liệu để người khác không chỉnh sửa được, nên xuất ra định dạng PDF — đây chính là ví dụ cụ thể của khái niệm nội dung số: nội dung tồn tại dưới dạng dữ liệu được mã hóa, có thể tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bc0cee45-f422-457e-a19b-5e57a32c9681', v_m_m3_f_01, 'M3-F-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tạo ba tài liệu cho cùng một nội dung công việc: một văn bản, một bảng tính, một trình chiếu — và giải thích khi nào dùng loại nào.

Sản phẩm nộp: 3 tệp kèm giải thích lựa chọn định dạng.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3c4135c4-2cb7-4689-a8fa-5e8afb4c402d', v_m_m3_f_01, 'M3-F-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khi cần trình bày số liệu để tính toán, nên dùng định dạng nào? A. Văn bản B. Bảng tính C. Trình chiếu D. Hình ảnh Đáp án: B — Bảng tính hỗ trợ tính toán và tổ chức dữ liệu theo ô, hàng, cột.

2. Một slide trình chiếu hiệu quả nên có đặc điểm gì? A. Càng nhiều chữ càng tốt B. Mỗi slide truyền tải một ý chính, chữ đủ lớn C. Dùng nhiều màu sắc sặc sỡ D. Không cần hình ảnh minh họa Đáp án: B — Slide đơn giản, tập trung một ý chính giúp người xem dễ tiếp thu.

3. Vì sao nên xuất tài liệu ra PDF trước khi gửi cho người khác? A. Để giảm dung lượng B. Để người nhận không chỉnh sửa được nội dung C. Để tăng tốc độ tải D. Không có lý do cụ thể Đáp án: B — PDF cố định định dạng, tránh nội dung bị chỉnh sửa ngoài ý muốn.

4. Trong bảng tính, mỗi hàng thường đại diện cho điều gì? A. Một thuộc tính B. Một bản ghi (ví dụ một khách hàng) C. Một công thức D. Không có ý nghĩa cụ thể Đáp án: B — Hàng thường thể hiện một bản ghi, cột thể hiện thuộc tính.

5. In đậm trong văn bản nên dùng khi nào? A. Cho toàn bộ đoạn văn B. Để nhấn mạnh từ khóa quan trọng, không lạm dụng C. Không bao giờ nên dùng D. Chỉ dùng cho tiêu đề Đáp án: B — In đậm hiệu quả nhất khi dùng có chọn lọc để nhấn mạnh.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('34778121-683b-4bd0-9fa1-2f3d6ff99d9b', v_m_m3_f_02, 'M3-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Chọn được các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp các mục đơn giản có nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8d4e1c83-b1f3-40ea-bc2e-95ceaf1f342c', v_m_m3_f_02, 'M3-F-02-02', 'Định nghĩa', 'TEXT', '- Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm

- Dán giữ định dạng: sao chép nội dung và giữ nguyên kiểu chữ, màu sắc gốc

- Dán văn bản thuần: sao chép chỉ lấy nội dung chữ, bỏ toàn bộ định dạng gốc

- Mẫu tài liệu (template): tài liệu có sẵn cấu trúc và định dạng để tái sử dụng nhiều lần', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0f7dcd64-739d-4de8-bb1a-d72ae029c2ad', v_m_m3_f_02, 'M3-F-02-03', 'Nội dung', 'TEXT', 'Tích hợp và tạo lập lại nội dung số nghĩa là sửa đổi, tinh chỉnh nội dung có sẵn để tạo ra nội dung mới. Khi nhận một tài liệu từ người khác để chỉnh sửa, cần thao tác cẩn thận để không làm hỏng định dạng đã có.

Khi sao chép nội dung từ nguồn khác, có hai lựa chọn: dán giữ định dạng hoặc dán văn bản thuần — dán văn bản thuần thường an toàn hơn khi muốn giữ tài liệu nhất quán. Mẫu tài liệu của doanh nghiệp giúp tiết kiệm thời gian và đảm bảo tính nhất quán. Trước khi gửi bất kỳ tài liệu nào, nên đọc lại toàn bộ một lượt để phát hiện lỗi.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ab299338-bdbb-4edb-a32b-8637c133acd0', v_m_m3_f_02, 'M3-F-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Nhận một tài liệu thô, chỉnh sửa theo mẫu của doanh nghiệp, chèn một bảng số liệu và một hình ảnh, rồi xuất PDF.

Sản phẩm nộp: Tài liệu hoàn chỉnh theo mẫu và bản PDF.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6c981b6a-681e-4b06-8916-1ee96a4ddcfb', v_m_m3_f_02, 'M3-F-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Dán văn bản thuần khác dán giữ định dạng như thế nào? A. Không có khác biệt B. Dán văn bản thuần bỏ định dạng gốc, dán giữ định dạng thì giữ nguyên C. Dán văn bản thuần nhanh hơn D. Dán giữ định dạng luôn tốt hơn Đáp án: B — Đây là điểm khác biệt cốt lõi giữa hai cách dán.

2. Vì sao nên dùng mẫu tài liệu có sẵn của doanh nghiệp? A. Không có lý do gì đặc biệt B. Tiết kiệm thời gian và đảm bảo tính nhất quán C. Chỉ để tuân thủ quy định D. Mẫu luôn đẹp hơn tự thiết kế Đáp án: B — Mẫu có sẵn giúp tiết kiệm công sức và giữ hình ảnh chuyên nghiệp thống nhất.

3. Khi nào nên chọn dán văn bản thuần thay vì dán giữ định dạng? A. Không bao giờ B. Khi muốn giữ tài liệu đích nhất quán về định dạng C. Khi cần giữ nguyên màu sắc gốc D. Không có sự khác biệt về khi nào nên dùng Đáp án: B — Dán văn bản thuần giúp tránh xung đột định dạng với tài liệu đích.

4. Trước khi gửi tài liệu, bước cuối cùng nên làm là gì? A. Không cần kiểm tra lại B. Đọc lại toàn bộ để phát hiện lỗi chính tả và định dạng C. Gửi ngay để tiết kiệm thời gian D. Chỉ cần kiểm tra tiêu đề Đáp án: B — Rà soát lại giúp phát hiện lỗi trước khi tài liệu đến tay người nhận.

5. Khi chèn bảng số liệu từ bảng tính vào văn bản, cần chú ý điều gì? A. Không cần chú ý gì đặc biệt B. Kiểm tra định dạng số và đơn vị hiển thị đúng C. Chỉ cần chèn càng nhanh càng tốt D. Luôn phải vẽ lại bảng thủ công Đáp án: B — Định dạng số có thể thay đổi khi chuyển giữa các ứng dụng, cần kiểm tra lại.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c930190a-6a6d-4ef3-b988-4a0c36ca27bf', v_m_m3_f_03, 'M3-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các quy tắc đơn giản về bản quyền và giấy phép áp dụng cho dữ liệu, thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b741dac3-7f7a-4530-bd35-bfae53bb0c3b', v_m_m3_f_03, 'M3-F-03-02', 'Định nghĩa', 'TEXT', '- Bản quyền: quyền pháp lý bảo vệ tác phẩm sáng tạo (hình ảnh, văn bản, âm nhạc) khỏi việc sử dụng trái phép

- Giấy phép sử dụng: điều kiện mà chủ sở hữu tác phẩm cho phép người khác sử dụng tác phẩm của mình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ddaab5ea-89e4-4b3d-b5fa-6bc925d82dcf', v_m_m3_f_03, 'M3-F-03-03', 'Nội dung', 'TEXT', 'Thực thi bản quyền và giấy phép nghĩa là hiểu được cách áp dụng bản quyền cho nội dung số. Bản quyền bảo vệ hầu hết các loại tác phẩm sáng tạo: hình ảnh, văn bản, âm nhạc, video. Một hiểu lầm phổ biến là nghĩ rằng bất cứ thứ gì tìm được trên mạng đều có thể tự do sử dụng.

Nhiều nền tảng cung cấp hình ảnh, nhạc, phông chữ miễn phí nhưng đi kèm điều kiện sử dụng cụ thể. Khi sử dụng nội dung của người khác được phép, cần ghi nguồn đầy đủ theo yêu cầu của giấy phép.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ceffecf3-7686-4cdb-a207-bd86a5a4c40a', v_m_m3_f_03, 'M3-F-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Tìm năm hình ảnh phù hợp cho một tài liệu công việc từ nguồn được phép sử dụng thương mại, ghi rõ giấy phép của từng hình.

Sản phẩm nộp: Bảng 5 hình ảnh kèm nguồn và loại giấy phép.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('70d8cda3-ca46-42cb-ab08-ded96f8b9334', v_m_m3_f_03, 'M3-F-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Tìm được một hình ảnh trên mạng có nghĩa là được tự do sử dụng không? A. Đúng, tìm được là được dùng B. Sai, cần kiểm tra điều kiện giấy phép trước khi sử dụng C. Chỉ đúng với hình ảnh cũ D. Chỉ đúng nếu không ghi tên tác giả Đáp án: B — Tìm được không đồng nghĩa với việc được phép sử dụng, đặc biệt cho mục đích thương mại.

2. Khi sử dụng nội dung có giấy phép yêu cầu ghi nguồn, cần làm gì? A. Không cần ghi gì cả B. Ghi tên tác giả và đường dẫn tới nguồn gốc theo yêu cầu giấy phép C. Chỉ cần ghi tên trang tải về D. Ghi nguồn là tùy chọn Đáp án: B — Ghi nguồn đúng yêu cầu giấy phép là điều kiện bắt buộc để sử dụng hợp pháp.

3. Nội dung “miễn phí” trên mạng có luôn được dùng cho mục đích thương mại không? A. Luôn được phép B. Không nhất thiết, cần đọc điều kiện giấy phép cụ thể C. Miễn phí nghĩa là không có điều kiện gì D. Chỉ áp dụng cho hình ảnh Đáp án: B — “Miễn phí” có thể đi kèm điều kiện hạn chế mục đích sử dụng.

4. Bản quyền bảo vệ những loại tác phẩm nào? A. Chỉ văn bản B. Hình ảnh, văn bản, âm nhạc, video, phông chữ thiết kế riêng C. Chỉ hình ảnh D. Chỉ nội dung có đăng ký chính thức Đáp án: B — Bản quyền bảo vệ đa dạng các loại tác phẩm sáng tạo.

5. Vi phạm bản quyền vô ý có gây rủi ro không? A. Không, chỉ vi phạm cố ý mới có rủi ro B. Có, vi phạm dù vô ý vẫn tạo ra rủi ro pháp lý và uy tín C. Chỉ có rủi ro với doanh nghiệp lớn D. Không có rủi ro thực tế Đáp án: B — Rủi ro pháp lý tồn tại kể cả khi vi phạm không cố ý, do đó cần kiểm tra trước khi sử dụng.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a55937e2-e9a5-475e-96a0-b646f031bdf8', v_m_m3_f_04, 'M3-F-04-01', 'Mục tiêu học tập', 'TEXT', '- Liệt kê được các hướng dẫn đơn giản để hệ thống máy tính giải quyết một vấn đề đơn giản hoặc thực hiện một nhiệm vụ đơn giản', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d487b81a-6067-4c85-8d91-0c2e2b2913b4', v_m_m3_f_04, 'M3-F-04-02', 'Định nghĩa', 'TEXT', '- Bước tuần tự: các hành động được thực hiện theo thứ tự cố định để hoàn thành một công việc

- Điều kiện nếu-thì: cấu trúc logic trong đó một hành động chỉ xảy ra khi một điều kiện cụ thể được thỏa mãn

- Công thức bảng tính: biểu thức tính toán tự động dựa trên giá trị trong các ô', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('50e7334d-7d87-4aa3-809f-9b6634a92a65', v_m_m3_f_04, 'M3-F-04-03', 'Nội dung', 'TEXT', 'Lập trình ở mức cơ bản nghĩa là liệt kê được các hướng dẫn đơn giản cho hệ thống máy tính. Chia một công việc thành các bước tuần tự rõ ràng là nền tảng của tư duy này. Nhiều công việc có chứa điều kiện nếu-thì, ví dụ “nếu đơn hàng trên 5 triệu thì áp dụng giảm giá 5%”.

Công thức bảng tính cơ bản như tính tổng, tính trung bình, đếm số lượng giúp xử lý số liệu nhanh hơn. Một nguyên tắc quan trọng: máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b3b4bf0d-8377-4832-a73a-0ab62f94ed2a', v_m_m3_f_04, 'M3-F-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Viết ra quy trình một công việc hàng ngày của mình thành các bước rõ ràng, chỉ ra bước nào có điều kiện và bước nào lặp lại.

Sản phẩm nộp: Quy trình công việc dạng các bước, có đánh dấu điểm có thể tự động hóa.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('014e856d-0081-43ff-ab31-2ff1a6ed2b59', v_m_m3_f_04, 'M3-F-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cần diễn đạt công việc thành các bước cụ thể, không mơ hồ? A. Không quan trọng B. Máy tính cần chỉ dẫn chính xác tuyệt đối, không thể “hiểu ý” như con người C. Chỉ để trình bày đẹp D. Không có lý do cụ thể Đáp án: B — Đây là nguyên tắc nền tảng của tư duy tính toán.

2. “Nếu đơn hàng trên 5 triệu thì giảm giá 5%” là ví dụ của cấu trúc gì? A. Bước tuần tự B. Điều kiện nếu-thì C. Công thức tổng D. Vòng lặp Đáp án: B — Đây là cấu trúc logic điều kiện, hành động chỉ xảy ra khi điều kiện được thỏa mãn.

3. Hàm điều kiện trong bảng tính có tác dụng gì? A. Chỉ để trang trí B. Tự động đưa ra kết quả khác nhau tùy giá trị đầu vào C. Không có tác dụng thực tế D. Chỉ dùng để đếm số Đáp án: B — Hàm điều kiện thực hiện logic nếu-thì một cách tự động.

4. Nhận biết công việc lặp đi lặp lại thủ công có ích gì? A. Không có ích gì B. Là bước đầu để nghĩ đến khả năng tự động hóa C. Chỉ để phàn nàn về khối lượng công việc D. Không liên quan đến tư duy tính toán Đáp án: B — Đây là bước chuẩn bị quan trọng cho việc tự động hóa ở mức cao hơn.

5. Điều gì KHÔNG đúng về máy tính khi thực hiện chỉ dẫn? A. Cần chỉ dẫn chính xác B. Có thể tự “hiểu ý” khi chỉ dẫn mơ hồ C. Thực hiện đúng theo logic được lập trình D. Không tự suy luận ngoài chỉ dẫn đã cho Đáp án: B — Máy tính không thể tự suy luận ý định khi chỉ dẫn không rõ ràng, khác với con người.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7a5820aa-c17b-4060-be66-6812623ccd1e', v_m_m3_i_01, 'M3-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Chỉ ra được cách tạo và chỉnh sửa nội dung ở các định dạng khác nhau

- Thể hiện được bản thân thông qua việc tạo ra các phương tiện số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1a7bcb41-9e21-4eea-bfef-806d1cd9caa1', v_m_m3_i_01, 'M3-I-01-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Bộ nhận diện (brand identity): tập hợp các yếu tố hình ảnh (màu sắc, phông chữ, logo) tạo nên sự nhất quán cho thương hiệu

- Phân cấp thông tin: cách sắp xếp nội dung theo mức độ quan trọng để người xem dễ nắm bắt ý chính trước', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9df284d1-f7f0-4418-aca4-1ab1007d91d8', v_m_m3_i_01, 'M3-I-01-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc phát triển nội dung số cần đạt chuẩn chuyên nghiệp hơn — tạo tài liệu theo bộ nhận diện thống nhất (cùng bảng màu, phông chữ, bố trí logo) giúp mọi tài liệu doanh nghiệp phát hành đều dễ nhận diện.

Nguyên tắc trình bày cơ bản gồm: sử dụng khoảng trắng hợp lý, phân cấp thông tin rõ ràng, tạo độ tương phản đủ để dễ đọc. Nội dung cần được điều chỉnh theo từng kênh: tài liệu in cần bố cục trang trọng, mạng xã hội cần ngắn gọn và bắt mắt.

Các công cụ thiết kế trực tuyến hiện nay cho phép người không chuyên tạo ra nội dung hình ảnh chuyên nghiệp thông qua mẫu có sẵn.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('42f51fbf-01ec-44dd-8555-76d5d34df1fa', v_m_m3_i_01, 'M3-I-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chuyển một nội dung công việc thành ba định dạng cho ba kênh khác nhau, giữ nhất quán về nhận diện.

Sản phẩm nộp: Bộ 3 sản phẩm nội dung cho 3 kênh.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('80ee9afa-5b00-4eeb-ae60-bef638876434', v_m_m3_i_01, 'M3-I-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bộ nhận diện thống nhất mang lại lợi ích gì? A. Không có lợi ích cụ thể B. Giúp tài liệu dễ nhận diện, tạo cảm giác chuyên nghiệp C. Chỉ để làm đẹp D. Tốn thời gian không cần thiết Đáp án: B — Nhận diện nhất quán xây dựng uy tín và sự chuyên nghiệp cho thương hiệu.

2. Nội dung cho mạng xã hội nên có đặc điểm gì so với tài liệu in? A. Giống hệt nhau B. Ngắn gọn, bắt mắt ngay từ đầu C. Cần nhiều chữ hơn D. Không cần điều chỉnh gì Đáp án: B — Mỗi kênh có đặc điểm tiêu thụ nội dung khác nhau, cần điều chỉnh phù hợp.

3. Vì sao cần cung cấp phụ đề cho video? A. Không cần thiết B. Giúp người xem trong môi trường ồn hoặc khiếm thính tiếp cận nội dung C. Chỉ để trang trí D. Làm video chậm hơn Đáp án: B — Phụ đề mở rộng khả năng tiếp cận nội dung cho nhiều đối tượng người xem.

4. Phân cấp thông tin trong thiết kế nghĩa là gì? A. Không có ý nghĩa cụ thể B. Sắp xếp nội dung theo mức độ quan trọng để dễ nắm bắt C. Chỉ dùng màu sắc khác nhau D. Chỉ áp dụng cho văn bản dài Đáp án: B — Phân cấp giúp người xem nhanh chóng nhận ra ý chính trước các chi tiết phụ.

5. Công cụ thiết kế trực tuyến với mẫu có sẵn giúp ích gì cho người không chuyên? A. Không có ích gì B. Cho phép tạo nội dung hình ảnh chuyên nghiệp không cần kiến thức thiết kế sâu C. Chỉ dùng được cho chuyên gia D. Tốn nhiều thời gian hơn thiết kế thủ công Đáp án: B — Mẫu có sẵn giúp người không chuyên vẫn tạo ra sản phẩm đạt chuẩn thẩm mỹ cơ bản.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7c467892-a0c9-4103-87cb-23124f3f5a5a', v_m_m3_i_02, 'M3-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận các cách sửa đổi, tinh chỉnh, cải thiện và tích hợp nội dung và thông tin mới để tạo ra những nội dung và thông tin mới và độc đáo', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c31fdc8e-1382-4b5a-aa2f-d97218d6067d', v_m_m3_i_02, 'M3-I-02-02', 'Định nghĩa', 'TEXT', '- Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm

- Trộn thư (mail merge): kỹ thuật tạo hàng loạt tài liệu cá nhân hóa từ một mẫu chung kết hợp với danh sách dữ liệu

- Liên kết dữ liệu: việc kết nối một bảng số liệu với văn bản để khi số liệu thay đổi, văn bản tự động cập nhật theo', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6f1c9e6e-8f50-4e84-87d2-8a82bd4f23af', v_m_m3_i_02, 'M3-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc tích hợp và tạo lập lại nội dung cần tổng hợp từ nhiều nguồn thành sản phẩm mới, đưa tri thức (sự hiểu biết, kinh nghiệm tích lũy) vào nội dung mới một cách nhất quán, tránh tình trạng “chắp vá” giữa các đoạn.

Xây dựng bộ mẫu tài liệu chuẩn giúp toàn bộ phận tiết kiệm thời gian khi nhiều người cùng tạo tài liệu. Liên kết dữ liệu giữa bảng tính và văn bản cho phép biểu đồ tự động cập nhật khi số liệu gốc thay đổi. Trộn thư là kỹ thuật hữu ích khi cần tạo nhiều tài liệu cá nhân hóa cùng lúc. Quản lý phiên bản nội dung là kỹ năng quan trọng khi nhiều người tham gia chỉnh sửa.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('363964d8-62ae-4b26-8c11-31f0c36839c3', v_m_m3_i_02, 'M3-I-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây một bộ mẫu tài liệu cho bộ phận (tối thiểu 3 mẫu) và tạo tài liệu hàng loạt từ một danh sách dữ liệu.

Sản phẩm nộp: Bộ mẫu tài liệu và sản phẩm tạo hàng loạt.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('87bfb454-4760-4bd1-9569-933b532178c9', v_m_m3_i_02, 'M3-I-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cần giữ mạch nhất quán khi tổng hợp nội dung từ nhiều nguồn? A. Không quan trọng B. Tránh cảm giác “chắp vá” khiến người đọc mất tin tưởng C. Chỉ để tiết kiệm thời gian D. Không có lý do cụ thể Đáp án: B — Sự thiếu nhất quán dễ bị người đọc nhận ra, ảnh hưởng đến tính chuyên nghiệp.

2. Trộn thư (mail merge) hữu ích trong trường hợp nào? A. Chỉ dùng cho một người nhận B. Tạo nhiều tài liệu cá nhân hóa cùng lúc từ mẫu chung và danh sách dữ liệu C. Không có ứng dụng thực tế D. Chỉ dùng cho hình ảnh Đáp án: B — Đây là công dụng chính của kỹ thuật trộn thư.

3. Liên kết dữ liệu giữa bảng tính và văn bản mang lại lợi ích gì? A. Không có lợi ích cụ thể B. Báo cáo tự động cập nhật khi số liệu gốc thay đổi C. Chỉ làm tài liệu nặng hơn D. Không thể thực hiện được Đáp án: B — Liên kết giúp tránh việc phải copy thủ công lại số liệu mỗi lần thay đổi.

4. Khi chuyển đổi định dạng tệp, cần kiểm tra điều gì sau khi chuyển? A. Không cần kiểm tra gì B. Định dạng số, ký tự đặc biệt, cấu trúc bảng có bị mất không C. Chỉ cần kiểm tra dung lượng D. Chỉ cần kiểm tra tên tệp Đáp án: B — Chuyển đổi định dạng có thể làm mất hoặc thay đổi một số yếu tố cần được xác nhận lại.

5. Quản lý phiên bản nội dung quan trọng khi nào? A. Không bao giờ quan trọng B. Khi nội dung được chỉnh sửa qua nhiều vòng, nhiều người tham gia C. Chỉ quan trọng với tài liệu ngắn D. Chỉ áp dụng cho hình ảnh Đáp án: B — Nhiều người cùng chỉnh sửa dễ gây nhầm lẫn về phiên bản nào là chính thức.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9b47feeb-0799-4f00-932a-dc1af2007a88', v_m_m3_i_03, 'M3-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận các quy tắc về bản quyền và giấy phép áp dụng cho thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d3e56034-6da1-4aad-8fab-e70a19d2d9f0', v_m_m3_i_03, 'M3-I-03-02', 'Định nghĩa', 'TEXT', '- Miền công cộng (public domain): tác phẩm không còn hoặc chưa từng thuộc bản quyền của riêng ai, có thể tự do sử dụng

- Nội dung do AI tạo ra: nội dung được tạo bởi công cụ trí tuệ nhân tạo, có vấn đề pháp lý về quyền sở hữu chưa hoàn toàn rõ ràng ở nhiều nơi', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('03ad7d13-7744-4ca0-a132-37288be19650', v_m_m3_i_03, 'M3-I-03-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc áp dụng quy tắc bản quyền và giấy phép cần chi tiết hơn — phân biệt các loại giấy phép phổ biến khác nhau về mức độ tự do sử dụng, và xác định quyền sở hữu nội dung do nhân viên tạo ra trong quá trình làm việc (thường thuộc quyền sở hữu của công ty theo hợp đồng lao động).

Khi sử dụng nội dung có yếu tố bên thứ ba — ví dụ hình ảnh có người thật xuất hiện — cần có sự đồng ý của người đó. Nội dung do công cụ AI tạo ra đang là vùng pháp lý chưa hoàn toàn rõ ràng, cần thận trọng khi dùng cho mục đích thương mại. Xây dựng quy trình kiểm tra bản quyền trước khi công bố giúp giảm rủi ro.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('92630c65-6fd8-4817-baae-b96b02cd165f', v_m_m3_i_03, 'M3-I-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây danh mục kiểm tra bản quyền cho quy trình xuất bản nội dung của bộ phận, áp dụng thử lên ba sản phẩm nội dung đã có.

Sản phẩm nộp: Danh mục kiểm tra bản quyền và kết quả rà soát ba sản phẩm.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8d63d58e-7119-4d3a-a755-8d6c55411de3', v_m_m3_i_03, 'M3-I-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Nội dung do nhân viên tạo ra trong giờ làm việc thường thuộc quyền sở hữu của ai? A. Luôn thuộc về nhân viên B. Thường thuộc công ty theo hợp đồng lao động C. Không thuộc về ai D. Luôn cần thỏa thuận riêng mỗi lần Đáp án: B — Đây là nguyên tắc phổ biến, nên được nêu rõ trong hợp đồng để tránh tranh chấp.

2. Khi hình ảnh có người thật xuất hiện được dùng cho mục đích thương mại, cần gì? A. Không cần gì đặc biệt B. Cần sự đồng ý của người đó C. Chỉ cần làm mờ mặt là đủ D. Chỉ cần ghi chú nguồn ảnh Đáp án: B — Sử dụng hình ảnh cá nhân cho mục đích thương mại cần có sự đồng ý rõ ràng.

3. Nội dung do AI tạo ra hiện nay có vấn đề pháp lý gì? A. Hoàn toàn rõ ràng về quyền sở hữu B. Chưa hoàn toàn rõ ràng về ai sở hữu bản quyền ở nhiều nơi C. Không có vấn đề gì D. Luôn thuộc về người dùng công cụ Đáp án: B — Đây là vùng pháp lý còn đang phát triển, cần thận trọng khi sử dụng cho mục đích quan trọng.

4. Miền công cộng (public domain) nghĩa là gì? A. Nội dung phải trả phí để sử dụng B. Tác phẩm không thuộc bản quyền riêng của ai, có thể tự do sử dụng C. Chỉ dành cho cơ quan nhà nước D. Nội dung bị cấm sử dụng Đáp án: B — Đây là định nghĩa của miền công cộng.

5. Quy trình kiểm tra bản quyền trước khi công bố nên bao gồm gì? A. Không cần quy trình gì B. Xác nhận nguồn gốc nội dung sử dụng và lưu hồ sơ chứng minh quyền sử dụng C. Chỉ cần hỏi miệng đồng nghiệp D. Chỉ áp dụng cho nội dung lớn Đáp án: B — Quy trình có hệ thống giúp giảm rủi ro vi phạm bản quyền một cách nhất quán.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3de2a4b8-c42f-4375-9d52-a6b32a6ea2c9', v_m_m3_i_04, 'M3-I-04-01', 'Mục tiêu học tập', 'TEXT', '- Liệt kê được các hướng dẫn cho một hệ thống máy tính để giải quyết một vấn đề nhất định hoặc thực hiện một nhiệm vụ cụ thể', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('196f2d54-a429-493c-8bf3-cc9367599bd8', v_m_m3_i_04, 'M3-I-04-02', 'Định nghĩa', 'TEXT', '- Hàm tra cứu (lookup function): công thức bảng tính tự động tìm và lấy giá trị tương ứng từ một bảng dữ liệu khác

- Công cụ nối ứng dụng (no-code automation): công cụ cho phép kết nối và tự động hóa quy trình giữa các ứng dụng mà không cần viết mã lập trình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9914f168-1781-4cca-b450-bdae4ee112b3', v_m_m3_i_04, 'M3-I-04-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc liệt kê hướng dẫn cho hệ thống máy tính giải quyết vấn đề cụ thể mở rộng sang tự động hóa công việc lặp lại — phân rã quy trình để xác định điểm có thể tự động hóa, thường là những bước lặp lại có quy tắc cố định.

Hàm điều kiện, hàm tra cứu, hàm xử lý văn bản trong bảng tính giúp xử lý khối lượng dữ liệu lớn nhanh hơn nhiều. Công cụ nối ứng dụng không cần lập trình cho phép kết nối các ứng dụng khác nhau. Không phải công việc lặp lại nào cũng đáng để tự động hóa — cần cân nhắc tần suất và mức độ ổn định của quy tắc.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('63ad67e0-31f6-4bf3-82f3-c08cec035604', v_m_m3_i_04, 'M3-I-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chọn một công việc lặp lại trong bộ phận, phân rã thành các bước, tự động hóa ít nhất một bước và đo thời gian tiết kiệm được.

Sản phẩm nộp: Sơ đồ quy trình, giải pháp tự động hóa, ước tính thời gian tiết kiệm.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('eb99dc1a-4f17-4d5f-a1cc-f3cf36e36890', v_m_m3_i_04, 'M3-I-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bước nào trong quy trình phù hợp nhất để tự động hóa? A. Bước cần phán đoán chủ quan B. Bước lặp lại có quy tắc cố định C. Bước chỉ làm một lần D. Bước không có quy tắc rõ ràng Đáp án: B — Các bước lặp lại theo quy tắc cố định dễ tự động hóa và mang lại hiệu quả cao nhất.

2. Hàm tra cứu trong bảng tính dùng để làm gì? A. Tính tổng số liệu B. Tự động tìm và lấy giá trị tương ứng từ bảng dữ liệu khác C. Định dạng chữ D. Xóa dữ liệu trùng lặp Đáp án: B — Đây là chức năng chính của hàm tra cứu.

3. Khi nào KHÔNG nên đầu tư công sức tự động hóa một công việc? A. Khi công việc lặp lại hàng ngày B. Khi tần suất thấp và quy tắc hay thay đổi C. Khi quy tắc rất ổn định D. Khi khối lượng công việc lớn Đáp án: B — Tần suất thấp và quy tắc không ổn định khiến chi phí duy trì tự động hóa không đáng công sức bỏ ra.

4. Rủi ro của việc tự động hóa sai là gì? A. Không có rủi ro gì đặc biệt B. Lỗi có thể lan rộng nhanh hơn lỗi thủ công C. Chỉ ảnh hưởng đến một trường hợp D. Dễ phát hiện hơn lỗi thủ công Đáp án: B — Hệ thống tự động xử lý số lượng lớn nên lỗi có thể nhân rộng nhanh chóng nếu không được kiểm soát.

5. Công cụ nối ứng dụng không cần lập trình cho phép làm gì? A. Chỉ dùng được bởi lập trình viên B. Kết nối và tự động hóa giữa các ứng dụng mà không cần viết mã C. Không có ứng dụng thực tế D. Chỉ dùng cho một ứng dụng duy nhất Đáp án: B — Đây là công dụng chính, giúp người không chuyên về lập trình vẫn có thể tự động hóa quy trình.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d751b530-7c11-433f-8ed9-13ac927e5768', v_m_m3_a_01, 'M3-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Thay đổi được nội dung bằng các định dạng phù hợp nhất

- Điều chỉnh được cách thể hiện bản thân thông qua việc tạo ra các phương tiện số phù hợp nhất', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2437c4e9-9b9d-4952-b64a-fa1a9b3946de', v_m_m3_a_01, 'M3-A-01-02', 'Định nghĩa', 'TEXT', '- Nội dung số (Điều 2, TT 02/2025/TT-BGDĐT): nội dung tồn tại dưới dạng dữ liệu số được mã hóa ở định dạng kỹ thuật số có thể đọc được và có thể được tạo, xem, phân phối, sửa đổi và lưu trữ bằng máy tính và công nghệ kỹ thuật số

- Chân dung đối tượng (persona): hồ sơ mô tả đặc điểm, nhu cầu của một nhóm khách hàng hoặc đối tượng mục tiêu điển hình

- Hành trình khách hàng: các giai đoạn một khách hàng trải qua từ khi biết đến sản phẩm đến khi mua và sử dụng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5b2f73c2-37af-4a1b-8239-3de587364bb7', v_m_m3_a_01, 'M3-A-01-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc thể hiện bản thân qua các phương tiện số phù hợp nhất đòi hỏi một chiến lược sản xuất nội dung gắn với mục tiêu kinh doanh, không chỉ dừng ở từng sản phẩm đơn lẻ.

Xây dựng chân dung đối tượng giúp định hướng nội dung phù hợp với nhu cầu thực tế. Bản đồ nội dung theo hành trình khách hàng giúp nội dung phát huy đúng vai trò ở đúng thời điểm. Quy trình sản xuất nội dung có thể mở rộng cần các bước rõ ràng: lên ý tưởng, duyệt đề cương, sản xuất, duyệt nội dung cuối, xuất bản, đánh giá hiệu quả.

Khi khối lượng sản xuất nội dung tăng lên, một người không thể tự làm hết mà cần hướng dẫn người khác cùng tạo nội dung theo đúng chuẩn — vai trò này không phải là kiểm tra từng chi tiết mọi lúc (dễ sa vào vi quản lý), mà là thiết lập tiêu chuẩn chất lượng rõ ràng ngay từ đầu và chỉ duyệt kỹ ở các điểm kiểm soát quan trọng trong quy trình.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('94802b69-198e-43e9-98a9-46eeb39871c6', v_m_m3_a_01, 'M3-A-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây chiến lược nội dung một quý cho doanh nghiệp: mục tiêu, đối tượng, chủ đề, kênh, lịch sản xuất, chỉ số đo lường.

Sản phẩm nộp: Chiến lược nội dung 1 quý, lịch sản xuất, bộ chỉ số.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5ffd306c-735d-4789-8596-53158134f30f', v_m_m3_a_01, 'M3-A-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Chiến lược nội dung nên bắt đầu từ đâu? A. Từ việc chọn kênh trước B. Từ mục tiêu kinh doanh cụ thể C. Từ xu hướng thịnh hành D. Từ ngân sách có sẵn Đáp án: B — Mục tiêu kinh doanh định hướng toàn bộ chiến lược nội dung phía sau.

2. Chân dung đối tượng dùng để làm gì? A. Không có tác dụng thực tế B. Định hướng nội dung phù hợp với nhu cầu thực tế của khách hàng C. Chỉ để trang trí báo cáo D. Chỉ áp dụng cho quảng cáo Đáp án: B — Hiểu rõ đối tượng giúp tạo nội dung đúng nhu cầu thay vì đoán mò.

3. Vì sao lượt xem không phải lúc nào cũng là chỉ số quan trọng nhất? A. Lượt xem luôn là chỉ số quan trọng nhất B. Tỷ lệ chuyển đổi mới phản ánh hiệu quả kinh doanh thực sự C. Không nên đo lường lượt xem D. Lượt xem không có ý nghĩa gì Đáp án: B — Lượt xem chỉ cho biết tiếp cận, chuyển đổi mới cho biết hiệu quả thực chất.

4. Quy trình sản xuất nội dung có thể mở rộng cần điều gì? A. Không cần quy trình rõ ràng B. Các bước rõ ràng với người chịu trách nhiệm cụ thể ở mỗi bước C. Chỉ cần một người làm tất cả D. Không cần duyệt nội dung Đáp án: B — Quy trình rõ ràng đảm bảo chất lượng đồng đều khi khối lượng sản xuất tăng.

5. Vai trò hướng dẫn người khác trong sản xuất nội dung bao gồm gì? A. Kiểm tra toàn bộ chi tiết mọi lúc B. Thiết lập tiêu chuẩn rõ ràng và duyệt ở các điểm kiểm soát quan trọng C. Không can thiệp gì D. Tự làm hết thay vì hướng dẫn Đáp án: B — Đây là cách quản lý chất lượng hiệu quả mà không sa vào vi quản lý.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('955250c6-4ac8-45e1-bb33-e63d1cb49c3b', v_m_m3_a_02, 'M3-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá những cách phù hợp nhất để sửa đổi, sàng lọc, cải thiện và tích hợp các mục nội dung và thông tin cụ thể mới để tạo ra những nội dung và thông tin mới và độc đáo', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5f2f382b-9982-459c-a99f-61e7e52aec96', v_m_m3_a_02, 'M3-A-02-02', 'Định nghĩa', 'TEXT', '- Tri thức (Điều 2, TT 02/2025/TT-BGDĐT): sự hiểu biết, nhận thức và kinh nghiệm được tích lũy qua quá trình học hỏi, nghiên cứu và trải nghiệm

- Tài sản nội dung: toàn bộ nội dung đã sản xuất (hình ảnh, văn bản, video) mà tổ chức sở hữu và có thể tái sử dụng

- Nội dung mô-đun: nội dung được thiết kế thành các khối nhỏ độc lập, có thể kết hợp lại theo nhiều cách khác nhau', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('221bf1e1-93aa-4dd3-b2fc-edacefaa9b93', v_m_m3_a_02, 'M3-A-02-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc đánh giá cách phù hợp nhất để tích hợp nội dung mới vào tri thức hiện có đòi hỏi xây dựng hệ thống quản trị tài sản nội dung cấp tổ chức.

Một thư viện tài sản nội dung có tổ chức — phân loại theo chủ đề, loại nội dung, chiến dịch — giúp toàn bộ phận dễ tìm và tái sử dụng. Thiết kế nội dung theo hướng mô-đun (tách thành khối nhỏ độc lập) cho phép kết hợp linh hoạt cho nhiều mục đích khác nhau. Nội dung cần có chu kỳ rà soát định kỳ để phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('facc9120-5bd4-4383-b6d5-e9eaadc8514c', v_m_m3_a_02, 'M3-A-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Thiết kế thư viện tài sản nội dung cho doanh nghiệp, gồm cấu trúc phân loại, quy ước gắn thẻ và quy trình rà soát định kỳ.

Sản phẩm nộp: Thiết kế thư viện nội dung và quy trình vận hành.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8ac755d4-05f9-4124-8654-73737af88482', v_m_m3_a_02, 'M3-A-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Nội dung mô-đun là gì? A. Nội dung dài không thể chỉnh sửa B. Nội dung được thiết kế thành khối nhỏ độc lập, có thể kết hợp linh hoạt C. Nội dung chỉ dùng một lần D. Nội dung không cần phân loại Đáp án: B — Đây là định nghĩa của thiết kế nội dung mô-đun.

2. Vì sao cần chu kỳ rà soát nội dung định kỳ? A. Không cần thiết nếu nội dung đã xuất bản B. Phát hiện nội dung lỗi thời cần cập nhật hoặc loại bỏ C. Chỉ để tăng số lượng nội dung D. Không có tác dụng thực tế Đáp án: B — Nội dung lỗi thời còn tồn tại có thể gây hiểu lầm hoặc tổn hại uy tín.

3. Bản địa hóa nội dung khi mở rộng thị trường bao gồm điều gì? A. Chỉ cần dịch ngôn ngữ B. Điều chỉnh cả ví dụ, hình ảnh cho phù hợp văn hóa địa phương C. Không cần điều chỉnh gì D. Chỉ áp dụng cho video Đáp án: B — Bản địa hóa toàn diện hơn việc dịch thuật đơn thuần.

4. Hệ thống gắn thẻ trong thư viện nội dung có vai trò gì? A. Không có vai trò cụ thể B. Quyết định khả năng tìm kiếm hiệu quả của thư viện C. Chỉ để trang trí D. Làm chậm quá trình lưu trữ Đáp án: B — Gắn thẻ nhất quán là yếu tố then chốt giúp tìm kiếm và tái sử dụng hiệu quả.

5. Đo lường hiệu quả tái sử dụng nội dung có thể dựa trên chỉ số nào? A. Chỉ số lượt thích B. So sánh chi phí sản xuất mới với tái sử dụng, tỷ lệ nội dung được dùng lại C. Không thể đo lường được D. Chỉ dựa vào cảm nhận Đáp án: B — Đây là các chỉ số định lượng phản ánh hiệu quả của việc tái sử dụng.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6952e305-ad03-436c-98b7-42889ec5095d', v_m_m3_a_03, 'M3-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Chọn được các quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép cho dữ liệu, thông tin và nội dung số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2627cc9b-d371-4a46-8f68-05d55c65a328', v_m_m3_a_03, 'M3-A-03-02', 'Định nghĩa', 'TEXT', '- Sở hữu trí tuệ: quyền pháp lý đối với các sáng tạo trí tuệ như tác phẩm, thiết kế, nhãn hiệu

- Hồ sơ chứng minh quyền sử dụng: tài liệu lưu trữ chứng minh doanh nghiệp có quyền hợp pháp sử dụng một nội dung cụ thể', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('385a5870-1078-4959-b12e-0897b7de6f71', v_m_m3_a_03, 'M3-A-03-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc chọn quy tắc phù hợp nhất để áp dụng bản quyền và giấy phép mở rộng thành quản trị rủi ro pháp lý cấp tổ chức — bản đồ rủi ro nội dung cần bao quát: hình ảnh không rõ nguồn gốc, nhạc nền chưa có bản quyền, phông chữ thương mại dùng trái phép, dữ liệu cá nhân trong nội dung marketing.

Chính sách sở hữu trí tuệ nội bộ nên quy định rõ ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép khi cần sử dụng tài sản trí tuệ bên ngoài. Khi làm việc với đơn vị sản xuất bên ngoài, hợp đồng cần có điều khoản rõ ràng về việc chuyển giao bản quyền.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3921df3e-e50f-4531-9056-6400fcbc61fc', v_m_m3_a_03, 'M3-A-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Rà soát rủi ro pháp lý cho toàn bộ kho nội dung đang sử dụng, soạn chính sách sở hữu trí tuệ nội bộ và điều khoản mẫu cho hợp đồng sản xuất.

Sản phẩm nộp: Báo cáo rà soát rủi ro, chính sách sở hữu trí tuệ, điều khoản hợp đồng mẫu.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('cf83c747-9022-46b4-936b-84b6385611ab', v_m_m3_a_03, 'M3-A-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khi thuê người làm tự do sản xuất nội dung mà không có điều khoản chuyển giao bản quyền, quyền sở hữu thuộc về ai? A. Luôn thuộc về bên thuê B. Có thể vẫn thuộc về người sáng tạo theo mặc định C. Không thuộc về ai D. Tự động thuộc về công chúng Đáp án: B — Không có điều khoản rõ ràng, quyền sở hữu mặc định có thể vẫn ở người tạo ra tác phẩm.

2. Vì sao cần lưu hồ sơ chứng minh quyền sử dụng nội dung? A. Không cần thiết B. Là bằng chứng cần thiết khi có tranh chấp phát sinh C. Chỉ để lưu trữ hình thức D. Không có tác dụng thực tế Đáp án: B — Hồ sơ đầy đủ bảo vệ doanh nghiệp khi bị khiếu nại hoặc tranh chấp bản quyền.

3. Khi nhận được khiếu nại bản quyền, bước đầu tiên nên làm là gì? A. Phớt lờ khiếu nại B. Xác minh tính hợp lệ của khiếu nại trước khi phản hồi C. Ngay lập tức thừa nhận sai D. Xóa toàn bộ nội dung liên quan ngay lập tức Đáp án: B — Xác minh trước giúp có phản ứng phù hợp, tránh hành động vội vàng không cần thiết.

4. Chính sách sở hữu trí tuệ nội bộ nên quy định điều gì? A. Không cần quy định gì cụ thể B. Ai sở hữu nội dung nhân viên tạo ra và quy trình xin phép sử dụng tài sản bên ngoài C. Chỉ áp dụng cho quản lý cấp cao D. Chỉ liên quan đến IT Đáp án: B — Đây là các nội dung cốt lõi cần có trong chính sách sở hữu trí tuệ.

5. Bản đồ rủi ro nội dung nên bao quát những nguồn rủi ro nào? A. Chỉ hình ảnh B. Hình ảnh, nhạc, phông chữ, dữ liệu cá nhân, phát ngôn gây tranh cãi C. Chỉ văn bản D. Chỉ liên quan đến video Đáp án: B — Rủi ro nội dung đến từ nhiều nguồn khác nhau, cần được rà soát toàn diện.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3d4d4504-e964-4dae-a25b-f98b353f815a', v_m_m3_a_04, 'M3-A-04-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các hướng dẫn thích hợp nhất cho hệ thống máy tính để giải quyết một vấn đề nhất định và thực hiện các nhiệm vụ cụ thể', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c1f382d2-c9b7-4c24-9c3e-e5eca3f44b97', v_m_m3_a_04, 'M3-A-04-02', 'Định nghĩa', 'TEXT', '- Mô hình hóa dữ liệu: việc xác định các thực thể, thuộc tính và mối quan hệ giữa chúng để tổ chức dữ liệu một cách logic

- Sơ đồ luồng xử lý: biểu diễn trực quan các bước và điểm quyết định trong một quy trình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('93a430ab-b4a0-4727-b26c-d4e55814fdc9', v_m_m3_a_04, 'M3-A-04-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc xác định hướng dẫn thích hợp nhất cho hệ thống máy tính mở rộng thành thiết kế giải pháp số cho nghiệp vụ — từ một vấn đề nghiệp vụ cụ thể, chuyển hóa thành yêu cầu giải pháp rõ ràng.

Mô hình hóa dữ liệu bắt đầu bằng việc xác định các thực thể chính, thuộc tính, và mối quan hệ giữa chúng. Sơ đồ luồng xử lý giúp hình dung các bước và điểm quyết định, cần chú ý xử lý cả trường hợp ngoại lệ. Khi vấn đề vượt quá khả năng của công cụ không cần lập trình, cần chuyển sang giải pháp công nghệ chuyên nghiệp — tập hợp công cụ kỹ thuật (phần mềm, phần cứng) hoặc dịch vụ để giải quyết vấn đề đặt ra.

Khi giải pháp nối nhiều bước tự động hóa với nhau (đầu ra của bước này là đầu vào của bước sau), cần lường trước rủi ro phụ thuộc: nếu một ứng dụng trong chuỗi ngừng hoạt động hoặc thay đổi cách vận hành, toàn bộ quy trình phía sau có thể bị gián đoạn theo — nên có phương án dự phòng hoặc cảnh báo sớm cho các bước quan trọng nhất trong chuỗi.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('94910659-f9eb-4531-affe-1761769d409f', v_m_m3_a_04, 'M3-A-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chọn một vấn đề nghiệp vụ thật, mô hình hóa dữ liệu và luồng xử lý, xây giải pháp tự động hóa và đánh giá hiệu quả.

Sản phẩm nộp: Tài liệu mô tả giải pháp, mô hình dữ liệu, sơ đồ luồng, giải pháp đã triển khai.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9458bdac-b487-43ff-9b07-82295b07ac59', v_m_m3_a_04, 'M3-A-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Mô hình hóa dữ liệu bắt đầu từ việc gì? A. Viết mã lập trình ngay B. Xác định các thực thể, thuộc tính và mối quan hệ giữa chúng C. Chọn công cụ tự động hóa D. Tính chi phí thực hiện Đáp án: B — Đây là bước nền tảng trước khi xây dựng bất kỳ giải pháp dữ liệu nào.

2. Sơ đồ luồng xử lý cần chú ý điều gì ngoài luồng chính? A. Chỉ cần luồng chính là đủ B. Cần xử lý các trường hợp ngoại lệ như dữ liệu thiếu, lỗi hệ thống C. Không cần quan tâm đến ngoại lệ D. Ngoại lệ không quan trọng bằng tốc độ xử lý Đáp án: B — Bỏ qua ngoại lệ khiến giải pháp dễ gặp lỗi khi vận hành thực tế.

3. Rủi ro phụ thuộc trong tự động hóa nhiều bước là gì? A. Không có rủi ro gì B. Nếu một ứng dụng trong chuỗi ngừng hoạt động, toàn bộ quy trình có thể gián đoạn C. Chỉ ảnh hưởng đến tốc độ D. Không liên quan đến vận hành Đáp án: B — Chuỗi tự động hóa phụ thuộc lẫn nhau, một điểm lỗi có thể ảnh hưởng toàn bộ.

4. Khi nào nên chuyển từ công cụ không cần lập trình sang giải pháp lập trình chuyên nghiệp? A. Luôn nên dùng lập trình ngay từ đầu B. Khi vấn đề đòi hỏi logic phức tạp hoặc tích hợp sâu vượt khả năng công cụ hiện có C. Không bao giờ cần chuyển D. Khi chi phí thấp Đáp án: B — Công cụ không cần lập trình có giới hạn về độ phức tạp có thể xử lý.

5. Khi mô tả yêu cầu cho đơn vị phát triển phần mềm, điều gì quan trọng hơn? A. Chỉ định công nghệ cụ thể cần dùng B. Mô tả rõ vấn đề cần giải quyết, kết quả mong muốn, ràng buộc C. Không cần mô tả chi tiết D. Chỉ cần đưa ngân sách Đáp án: B — Mô tả rõ vấn đề và kết quả mong muốn giúp đơn vị phát triển đề xuất giải pháp phù hợp nhất.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6998e7a4-d55a-4df4-adc1-e29555da11be', v_m_m4_f_01, 'M4-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Nhận biết được cách bảo vệ thiết bị và nội dung số một cách đơn giản

- Phân biệt được rủi ro và mối đe dọa đơn giản trong môi trường số

- Tuân theo được các biện pháp an toàn và bảo mật đơn giản

- Nhận biết được những cách thức đơn giản để quan tâm đến mức độ tin cậy và quyền riêng tư', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('56624bac-a173-4498-80b9-32cd63f0ceea', v_m_m4_f_01, 'M4-F-01-02', 'Định nghĩa', 'TEXT', '- Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số

- Mật khẩu mạnh: mật khẩu đủ dài (tối thiểu 12 ký tự), kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không trùng với mật khẩu dùng ở nơi khác

- Xác thực hai lớp (2FA): phương thức bảo mật yêu cầu thêm một bước xác nhận ngoài mật khẩu (mã gửi về điện thoại, ứng dụng xác thực)

- Trình quản lý mật khẩu: phần mềm lưu trữ và tự động điền mật khẩu an toàn, giúp không cần nhớ nhiều mật khẩu phức tạp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6a6671d5-426f-4c61-b214-05287d3bb3b8', v_m_m4_f_01, 'M4-F-01-03', 'Nội dung', 'TEXT', 'Bảo vệ thiết bị nghĩa là bảo vệ các thiết bị số — thiết bị điện tử, máy tính, viễn thông và thiết bị tích hợp khác dùng để xử lý, lưu trữ và trao đổi thông tin số. Mật khẩu mạnh cần đủ dài, kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt, không dùng lại ở nhiều nơi.

Xác thực hai lớp bổ sung một lớp bảo vệ: kể cả khi mật khẩu bị lộ, kẻ xấu vẫn cần thêm mã xác thực mới đăng nhập được. Cập nhật hệ điều hành và ứng dụng thường xuyên vá các lỗ hổng bảo mật đã biết. Dấu hiệu thiết bị bất thường bao gồm pin hết nhanh, thiết bị nóng hoặc chạy chậm không rõ nguyên nhân.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f09b7b32-b13b-406e-b908-3f9e32b6c002', v_m_m4_f_01, 'M4-F-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Rà soát các tài khoản công việc đang dùng (liệt kê tối thiểu 5 tài khoản: email, hệ thống nội bộ, mạng xã hội công ty…), bật xác thực hai lớp cho tối thiểu 3 tài khoản quan trọng nhất, và kiểm tra tình trạng cập nhật của thiết bị đang dùng.

Sản phẩm nộp: Bảng kiểm 5 tài khoản (đã bật 2FA hay chưa) và ảnh chụp trạng thái cập nhật thiết bị.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('20a58904-f24b-43a4-8551-6d9a24874f72', v_m_m4_f_01, 'M4-F-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao không nên dùng lại cùng một mật khẩu cho nhiều tài khoản? A. Vì mất nhiều thời gian gõ hơn B. Nếu một dịch vụ bị lộ dữ liệu, các tài khoản khác dùng chung mật khẩu cũng gặp rủi ro C. Vì hệ thống sẽ báo lỗi D. Không có lý do cụ thể Đáp án: B — Lộ mật khẩu ở một nơi có thể kéo theo rủi ro cho toàn bộ tài khoản dùng chung mật khẩu đó.

2. Xác thực hai lớp bổ sung điều gì so với chỉ dùng mật khẩu? A. Không có gì khác biệt B. Yêu cầu thêm một bước xác nhận, bảo vệ tài khoản kể cả khi mật khẩu bị lộ C. Làm chậm quá trình đăng nhập không cần thiết D. Chỉ dùng cho tài khoản ngân hàng Đáp án: B — 2FA là lớp bảo vệ bổ sung, hữu ích ngay cả khi mật khẩu đã bị lộ.

3. Vì sao nên cập nhật thiết bị và phần mềm thường xuyên? A. Chỉ để có giao diện mới B. Các bản cập nhật thường vá lỗ hổng bảo mật đã biết C. Không có lý do liên quan bảo mật D. Chỉ để tăng dung lượng lưu trữ Đáp án: B — Cập nhật là cách chính để đóng các lỗ hổng bảo mật đã được phát hiện.

4. Dấu hiệu nào sau đây có thể cho thấy thiết bị bị xâm nhập? A. Pin hết nhanh bất thường, xuất hiện ứng dụng lạ B. Thiết bị đang sạc pin bình thường C. Có bản cập nhật mới D. Wifi kết nối chậm do mạng yếu Đáp án: A — Đây là các dấu hiệu bất thường cần lưu ý kiểm tra thêm.

5. Trình quản lý mật khẩu giúp ích gì? A. Không có tác dụng thực tế B. Tạo và lưu mật khẩu riêng biệt, đủ mạnh cho từng tài khoản C. Chỉ dùng để ghi chú D. Làm chậm máy tính Đáp án: B — Đây là công dụng chính, giúp người dùng không cần nhớ nhiều mật khẩu phức tạp.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e2a886f6-f831-4654-aa3d-5173fec7d4d6', v_m_m4_f_02, 'M4-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Lựa chọn được những cách thức đơn giản để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số

- Nhận biết được các cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn

- Nhận diện được các tuyên bố cơ bản trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e95ba17a-f466-4cf8-987c-87e772dc07b5', v_m_m4_f_02, 'M4-F-02-02', 'Định nghĩa', 'TEXT', '- Thông tin cá nhân: thông tin gắn liền hoặc giúp xác định một người cụ thể — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước

- Lừa đảo giả mạo (phishing): hình thức lừa đảo qua email, tin nhắn hoặc cuộc gọi giả danh một tổ chức đáng tin để lấy thông tin hoặc tiền

- Quyền ứng dụng: các loại dữ liệu hoặc chức năng thiết bị mà một ứng dụng được phép truy cập (camera, vị trí, danh bạ)', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c71ca182-135e-42a3-a24d-f6dbc72e319f', v_m_m4_f_02, 'M4-F-02-03', 'Nội dung', 'TEXT', 'Bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số bắt đầu từ việc nhận biết thông tin cá nhân — họ tên, ngày sinh, số điện thoại, địa chỉ, hình ảnh, số căn cước. Lừa đảo giả mạo thường tạo cảm giác khẩn cấp và yêu cầu cung cấp thông tin nhạy cảm qua liên kết.

Nguyên tắc an toàn cơ bản: không bấm vào liên kết lạ, không bao giờ cung cấp mã xác thực cho bất kỳ ai qua điện thoại. Trên điện thoại, nên rà soát định kỳ và thu hồi quyền truy cập ứng dụng không cần thiết. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân loại thành dữ liệu cơ bản và dữ liệu nhạy cảm, cần mức độ bảo vệ khác nhau.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('82957cc9-1776-4678-b0ba-e1316697e4b4', v_m_m4_f_02, 'M4-F-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Phân tích 5 email/tin nhắn mẫu (tự tìm hoặc dùng email lạ từng nhận được), xác định cái nào là lừa đảo và chỉ ra dấu hiệu; rà soát quyền ứng dụng trên điện thoại cá nhân.

Sản phẩm nộp: Bảng phân tích 5 tin nhắn và kết quả rà soát quyền ứng dụng.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('74c0a7c0-d2e6-4925-a064-d58bd094f9ad', v_m_m4_f_02, 'M4-F-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Dấu hiệu điển hình của một email lừa đảo là gì? A. Địa chỉ gửi chính xác 100% B. Tạo cảm giác khẩn cấp, yêu cầu cung cấp thông tin qua liên kết C. Không có yêu cầu hành động gì D. Gửi từ đồng nghiệp quen biết Đáp án: B — Tạo áp lực thời gian và yêu cầu hành động ngay là chiến thuật phổ biến của lừa đảo.

2. Khi nhận được yêu cầu cung cấp mã OTP qua điện thoại, nên làm gì? A. Cung cấp ngay nếu người gọi tự xưng là ngân hàng B. Từ chối — không tổ chức hợp pháp nào yêu cầu mã OTP qua điện thoại C. Cung cấp nếu họ biết tên mình D. Tùy vào giọng điệu người gọi Đáp án: B — Mã OTP không bao giờ nên được chia sẻ qua điện thoại với bất kỳ ai.

3. Một ứng dụng đèn pin xin quyền truy cập danh bạ. Đây có phải dấu hiệu đáng ngờ không? A. Không, đây là điều bình thường B. Có, ứng dụng đèn pin không có lý do chính đáng cần quyền này C. Chỉ đáng ngờ nếu ứng dụng miễn phí D. Không cần quan tâm đến quyền ứng dụng Đáp án: B — Quyền yêu cầu không liên quan đến chức năng ứng dụng là dấu hiệu cần cảnh giác.

4. Khi nghi ngờ thông tin cá nhân bị lộ, bước đầu tiên nên làm là gì? A. Không làm gì, chờ xem có vấn đề gì xảy ra không B. Đổi mật khẩu tài khoản liên quan và bật xác thực hai lớp C. Xóa toàn bộ tài khoản D. Đổi số điện thoại ngay lập tức Đáp án: B — Đây là hành động phòng ngừa nhanh và hiệu quả nhất khi nghi ngờ có sự cố.

5. Thông tin nào sau đây được coi là thông tin cá nhân? A. Giá sản phẩm của công ty B. Số điện thoại và địa chỉ nhà C. Tỷ giá ngoại tệ D. Thời tiết hôm nay Đáp án: B — Đây là thông tin gắn liền và giúp xác định một cá nhân cụ thể.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a8df3af1-833f-4526-8d81-492dd8f3bc40', v_m_m4_f_03, 'M4-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được các cách thức đơn giản để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số

- Lựa chọn được những cách thức đơn giản để bảo vệ bản thân khỏi nguy cơ trong môi trường số

- Nhận biết được những công nghệ số đơn giản giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e664bbd2-cd32-4441-922c-d57e3c1e1d1b', v_m_m4_f_03, 'M4-F-03-02', 'Định nghĩa', 'TEXT', '- An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số

- Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử

- Tư thế làm việc đúng: cách bố trí màn hình, ghế, bàn phím giúp giảm căng thẳng cơ thể khi làm việc lâu với máy tính

- Quá tải thông tin: trạng thái tiếp nhận quá nhiều thông báo, tin nhắn, email cùng lúc gây khó tập trung và căng thẳng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d38e19b5-2509-483f-8fbb-0ba2f9c327e6', v_m_m4_f_03, 'M4-F-03-03', 'Nội dung', 'TEXT', 'Bảo vệ sức khỏe và an sinh số nghĩa là tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số — an sinh số là trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng.

Tư thế làm việc đúng bắt đầu từ vị trí màn hình ngang tầm mắt, khoảng cách 50–70cm. Quy tắc 20-20-20 giúp giảm mỏi mắt: mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây. Bắt nạt trên mạng là hành vi có chủ đích xấu đe dọa, xúc phạm qua tin nhắn, mạng xã hội — cần nhận biết và bảo vệ bản thân khỏi nguy cơ này.

Bên cạnh việc phòng tránh rủi ro, công nghệ số cũng có thể được dùng theo hướng tích cực để tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội — ví dụ các ứng dụng theo dõi giấc ngủ và vận động giúp duy trì thói quen lành mạnh, các nền tảng kết nối cộng đồng giúp người dùng tìm được nhóm hỗ trợ phù hợp, hoặc các công cụ thiền định/thư giãn trực tuyến giúp giảm căng thẳng. Nhận biết được những công nghệ này giúp người dùng chủ động sử dụng công nghệ số theo hướng có lợi cho sức khỏe tinh thần, không chỉ dừng ở việc phòng thủ trước rủi ro.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('10f6042d-ab91-4bed-8dab-451c681ae965', v_m_m4_f_03, 'M4-F-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chụp ảnh và đánh giá chỗ làm việc hiện tại theo danh mục kiểm tra dưới đây, thực hiện điều chỉnh và ghi lại.

Danh mục kiểm tra chỗ làm việc:

Sản phẩm nộp: Đánh giá chỗ làm việc trước và sau điều chỉnh (dùng bảng trên).', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('15a8e11a-d4a3-4e4e-9c3c-7e8977c0c7c3', v_m_m4_f_03, 'M4-F-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Quy tắc 20-20-20 nghĩa là gì? A. Làm việc 20 phút nghỉ 20 giờ B. Mỗi 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây C. Nghỉ 20 phút mỗi 20 giờ làm việc D. Không có quy tắc như vậy Đáp án: B — Đây là nguyên tắc giúp giảm mỏi mắt khi làm việc lâu với màn hình.

2. Vị trí màn hình đúng nên như thế nào? A. Cao hơn tầm mắt nhiều B. Mép trên ngang hoặc thấp hơn tầm mắt một chút C. Không quan trọng vị trí D. Càng gần mắt càng tốt Đáp án: B — Vị trí này giúp giảm căng thẳng cổ và mắt khi làm việc lâu.

3. Dấu hiệu nào cho thấy quá tải thông tin? A. Cảm thấy thư giãn khi kiểm tra điện thoại B. Khó tập trung vì liên tục bị gián đoạn bởi thông báo C. Không có thông báo nào D. Làm việc hiệu quả hơn Đáp án: B — Đây là dấu hiệu điển hình của quá tải thông tin.

4. Vì sao nên tắt thông báo công việc ngoài giờ? A. Không cần thiết B. Giúp thiết lập ranh giới rõ ràng giữa làm việc và nghỉ ngơi C. Sẽ bị đánh giá là thiếu trách nhiệm D. Không có lợi ích gì Đáp án: B — Ranh giới rõ ràng giúp bảo vệ thời gian nghỉ ngơi cần thiết.

5. Khi căng thẳng công việc kéo dài, nên làm gì? A. Tự chịu đựng một mình B. Tìm đến sự hỗ trợ chuyên môn khi cần thiết C. Bỏ qua vì đây là chuyện bình thường D. Không nên chia sẻ với ai Đáp án: B — Tìm hỗ trợ chuyên môn khi cần là hành động phù hợp và nên được khuyến khích.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ae683d36-b9fb-4d5a-a113-147babb71548', v_m_m4_f_04, 'M4-F-04-01', 'Mục tiêu học tập', 'TEXT', '- Nhận biết được tác động cơ bản của công nghệ số và việc sử dụng công nghệ số đối với môi trường', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('49213be2-358d-4fb3-a20e-0218cc9200be', v_m_m4_f_04, 'M4-F-04-02', 'Định nghĩa', 'TEXT', '- Vòng đời thiết bị: toàn bộ quá trình từ sản xuất, sử dụng đến thải bỏ một thiết bị điện tử

- Rác thải điện tử: thiết bị điện tử đã hỏng hoặc không còn sử dụng, cần được xử lý đúng cách để tránh ô nhiễm', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1b48bf02-bca7-4488-9537-f54e08369e9a', v_m_m4_f_04, 'M4-F-04-03', 'Nội dung', 'TEXT', 'Bảo vệ môi trường nghĩa là nhận thức được tác động của công nghệ số và việc sử dụng công nghệ số đối với môi trường. Mỗi thiết bị điện tử đều có tác động môi trường trong suốt vòng đời: khai thác nguyên liệu, tiêu thụ năng lượng khi sử dụng, trở thành rác thải khi loại bỏ.

Thói quen tiết kiệm năng lượng đơn giản gồm tắt máy tính khi không dùng, bật chế độ tiết kiệm năng lượng. Khi thiết bị cần thải bỏ, cần đưa đến điểm thu gom rác thải điện tử chuyên biệt và xóa sạch dữ liệu cá nhân trước khi thải bỏ.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1d12e38a-5176-46c7-88ee-1ba432b488da', v_m_m4_f_04, 'M4-F-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Đánh giá thói quen sử dụng công nghệ của bản thân hoặc bộ phận trong một tuần, đề xuất 5 thay đổi khả thi và ước tính tác động.

Sản phẩm nộp: Bảng đánh giá thói quen và 5 đề xuất cải thiện.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('48609cf3-967e-4970-879f-1b0c27e7cc4c', v_m_m4_f_04, 'M4-F-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Dịch vụ lưu trữ đám mây có tác động môi trường không? A. Không, vì không dùng thiết bị vật lý B. Có, vì trung tâm dữ liệu tiêu thụ năng lượng thực tế C. Chỉ có tác động nếu dùng miễn phí D. Không có cách nào đo lường được Đáp án: B — Trung tâm dữ liệu vận hành đám mây vẫn tiêu thụ điện năng đáng kể trong thực tế.

2. Vì sao nên xóa dữ liệu cá nhân trước khi thải bỏ thiết bị điện tử? A. Không cần thiết B. Để tránh rủi ro rò rỉ thông tin cá nhân C. Chỉ để tiết kiệm dung lượng D. Không có lý do liên quan bảo mật Đáp án: B — Thiết bị thải bỏ có thể vẫn chứa dữ liệu nhạy cảm nếu không được xóa đúng cách.

3. Rác thải điện tử nên được xử lý như thế nào? A. Bỏ chung với rác sinh hoạt B. Đưa đến điểm thu gom rác thải điện tử chuyên biệt C. Đốt tại nhà D. Không cần xử lý đặc biệt Đáp án: B — Xử lý đúng cách giúp giảm ô nhiễm môi trường từ các chất độc hại trong thiết bị điện tử.

4. Kéo dài tuổi thọ thiết bị bằng cách nào? A. Thay mới ngay khi có phiên bản mới B. Sửa chữa khi có thể thay vì thay mới ngay C. Không bảo trì thiết bị D. Sử dụng liên tục không nghỉ Đáp án: B — Sửa chữa và bảo trì giúp kéo dài vòng đời thiết bị, giảm rác thải điện tử.

5. Họp trực tuyến thay vì di chuyển có lợi ích môi trường gì? A. Không có lợi ích gì B. Giảm phát thải gián tiếp từ việc đi lại C. Chỉ tiết kiệm thời gian D. Không liên quan đến môi trường Đáp án: B — Giảm nhu cầu di chuyển góp phần giảm phát thải khí nhà kính gián tiếp.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e7ef19c5-7076-4f94-b2cf-99294bea9888', v_m_m4_i_01, 'M4-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Thiết lập được những cách thức bảo vệ thiết bị và nội dung số

- Phân biệt được rủi ro và mối đe dọa trong môi trường số

- Chọn lựa được các biện pháp an toàn và bảo mật

- Giải thích được các cách thức để quan tâm đến mức độ tin cậy và quyền riêng tư', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('053a7b14-a3dd-4369-9800-235f736991bf', v_m_m4_i_01, 'M4-I-01-02', 'Định nghĩa', 'TEXT', '- Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số

- Chính sách bảo mật doanh nghiệp: bộ quy định về cách nhân viên phải bảo vệ thông tin và hệ thống của công ty

- Sao lưu (backup): bản sao dữ liệu độc lập, không thay đổi theo bản gốc, dùng để khôi phục khi có sự cố

- Tấn công lừa đảo có chủ đích (spear phishing): hình thức lừa đảo được cá nhân hóa nhắm vào một người hoặc tổ chức cụ thể, thường có thông tin chính xác khiến nạn nhân dễ tin hơn', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('45110d37-8f48-4b17-a52b-99f307eacbc6', v_m_m4_i_01, 'M4-I-01-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc bảo vệ thiết bị và nội dung số mở rộng sang môi trường làm việc — áp dụng chính sách bảo mật doanh nghiệp: không chia sẻ tài khoản đăng nhập, không cài phần mềm ngoài danh sách được phê duyệt.

Khi làm việc ngoài văn phòng, cần tránh dùng wifi công cộng không có mật khẩu để truy cập hệ thống công ty. Sự khác biệt quan trọng giữa đồng bộ và sao lưu: đồng bộ sẽ lan truyền cả những thay đổi không mong muốn, trong khi sao lưu là một bản sao độc lập. Tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường vì được cá nhân hóa — cách phòng vệ tốt nhất là luôn xác minh qua kênh khác khi nhận yêu cầu bất thường.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('99c5d514-4408-43a9-8cbb-2f6d35f4b111', v_m_m4_i_01, 'M4-I-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Lập danh mục kiểm tra bảo mật cho công việc của bộ phận mình, tự đánh giá và xác định 3 điểm yếu lớn nhất.

Sản phẩm nộp: Danh mục kiểm tra bảo mật và báo cáo tự đánh giá.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a4f810ec-f824-467f-ae2e-2555e7397019', v_m_m4_i_01, 'M4-I-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Sự khác biệt cốt lõi giữa đồng bộ và sao lưu là gì? A. Không có khác biệt B. Đồng bộ lan truyền cả thay đổi không mong muốn, sao lưu là bản sao độc lập C. Sao lưu nhanh hơn đồng bộ D. Đồng bộ an toàn hơn sao lưu Đáp án: B — Đây là điểm khác biệt quan trọng cần hiểu để bảo vệ dữ liệu đúng cách.

2. Khi nhận yêu cầu chuyển tiền gấp qua email từ “giám đốc”, dù nội dung rất thuyết phục, nên làm gì? A. Chuyển ngay để không trễ hạn B. Xác minh qua kênh khác (gọi điện trực tiếp) trước khi hành động C. Trả lời email hỏi thêm chi tiết D. Chuyển tiền một phần để giảm rủi ro Đáp án: B — Xác minh qua kênh độc lập là biện pháp phòng vệ hiệu quả nhất với lừa đảo có chủ đích.

3. Vì sao tấn công lừa đảo có chủ đích nguy hiểm hơn lừa đảo thông thường? A. Không nguy hiểm hơn B. Được cá nhân hóa với thông tin chính xác, khiến nạn nhân dễ tin hơn C. Chỉ nhắm vào doanh nghiệp lớn D. Dễ nhận biết hơn lừa đảo thông thường Đáp án: B — Tính cá nhân hóa cao làm giảm khả năng nạn nhân nghi ngờ.

4. Khi làm việc ở nơi công cộng với wifi không rõ nguồn gốc, nên làm gì? A. Kết nối bình thường để tiết kiệm dữ liệu di động B. Tránh truy cập hệ thống công ty, hoặc dùng VPN nếu bắt buộc C. Không có vấn đề gì cần lưu ý D. Chỉ cần tắt camera laptop Đáp án: B — Wifi công cộng không an toàn có thể bị lợi dụng để đánh cắp dữ liệu truyền qua đó.

5. Khi phát hiện sự cố bảo mật, nên làm gì? A. Tự xử lý một mình để tránh phiền phức B. Báo cáo ngay cho bộ phận phụ trách theo quy trình nội bộ C. Im lặng vì sợ bị trách D. Chỉ kể cho đồng nghiệp thân thiết Đáp án: B — Báo cáo kịp thời giúp hạn chế thiệt hại và xử lý đúng quy trình.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a071298b-edee-4048-9d21-6a61c66da47f', v_m_m4_i_02, 'M4-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận về cách bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số

- Thảo luận về cách sử dụng và chia sẻ thông tin định danh cá nhân một cách an toàn

- Chỉ ra được các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('24c649ef-35de-4312-b551-962d3f39433a', v_m_m4_i_02, 'M4-I-02-02', 'Định nghĩa', 'TEXT', '- Dữ liệu cá nhân cơ bản: thông tin gắn liền hoặc giúp xác định một người, ví dụ họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ, hình ảnh (theo Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân)

- Dữ liệu cá nhân nhạy cảm: dữ liệu gắn liền với quyền riêng tư, khi bị xâm phạm sẽ ảnh hưởng trực tiếp đến quyền và lợi ích hợp pháp của cá nhân — ví dụ tình trạng sức khỏe, quan điểm chính trị, dữ liệu tài chính, dữ liệu sinh trắc học

- Sự đồng ý của chủ thể dữ liệu: việc chủ thể dữ liệu tự nguyện xác nhận đồng ý cho một hoặc nhiều mục đích xử lý dữ liệu cụ thể của mình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('763a91a5-11a5-4a2d-827e-0b4a9c682d92', v_m_m4_i_02, 'M4-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc bảo vệ dữ liệu cá nhân mở rộng sang xử lý dữ liệu khách hàng trong công việc. Nguyên tắc thu thập tối thiểu là chỉ thu thập dữ liệu cá nhân thực sự cần thiết cho mục đích cụ thể, không thu thập “phòng khi cần”.

Phân quyền truy cập theo mức nhạy cảm: dữ liệu cơ bản có thể được nhiều bộ phận truy cập theo nhu cầu, dữ liệu nhạy cảm cần giới hạn nghiêm ngặt hơn. Nên ẩn danh hoặc giả danh hóa khi phân tích để giảm rủi ro. Khách hàng có quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu cá nhân của họ — doanh nghiệp cần có quy trình xử lý các yêu cầu này.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6a811e7e-9edc-4ac6-8540-08d1414b7a24', v_m_m4_i_02, 'M4-I-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Rà soát một tập dữ liệu công việc thật (hoặc dùng bảng mẫu ở trên làm điểm khởi đầu, bổ sung thêm 5–10 trường của dữ liệu thật bộ phận đang dùng), phân loại từng trường theo mức nhạy cảm, tạo bản trích xuất tối thiểu cho một mục đích phân tích cụ thể.

Sản phẩm nộp: Bảng phân loại trường dữ liệu, bản trích xuất tối thiểu, giải trình.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7142742a-b23d-4570-84ab-27aeb50ba2f1', v_m_m4_i_02, 'M4-I-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Theo Nghị định 13/2023/NĐ-CP, dữ liệu cá nhân được phân thành mấy loại chính? A. Một loại duy nhất B. Hai loại: cơ bản và nhạy cảm C. Ba loại D. Không phân loại Đáp án: B — Nghị định 13 phân dữ liệu cá nhân thành dữ liệu cơ bản và dữ liệu nhạy cảm.

2. Nguyên tắc thu thập tối thiểu nghĩa là gì? A. Thu thập càng nhiều dữ liệu càng tốt B. Chỉ thu thập dữ liệu thực sự cần thiết cho mục đích cụ thể C. Không thu thập dữ liệu nào D. Chỉ áp dụng cho doanh nghiệp lớn Đáp án: B — Đây là nguyên tắc cốt lõi trong bảo vệ dữ liệu cá nhân.

3. Dán danh sách khách hàng vào một công cụ trực tuyến miễn phí chưa được phê duyệt có vấn đề gì? A. Không có vấn đề gì B. Là hình thức chuyển giao dữ liệu ra ngoài kiểm soát, tiềm ẩn rủi ro vi phạm C. Chỉ có vấn đề nếu công cụ đó tính phí D. Luôn an toàn nếu công cụ có tên tuổi Đáp án: B — Dữ liệu cá nhân được đưa ra ngoài hệ thống được kiểm soát là rủi ro tuân thủ nghiêm trọng.

4. Khách hàng có quyền gì đối với dữ liệu cá nhân của họ? A. Không có quyền gì B. Quyền yêu cầu truy cập, sửa đổi, hoặc yêu cầu xóa dữ liệu C. Chỉ có quyền xem, không được yêu cầu sửa D. Chỉ áp dụng cho khách hàng VIP Đáp án: B — Đây là các quyền cơ bản của chủ thể dữ liệu.

5. Sự đồng ý của chủ thể dữ liệu cần có đặc điểm gì? A. Có thể dùng một lần đồng ý chung cho mọi mục đích mãi mãi B. Rõ ràng, cụ thể cho từng mục đích sử dụng C. Không cần thiết nếu doanh nghiệp nhỏ D. Chỉ cần đồng ý bằng miệng Đáp án: B — Đồng ý chung chung không đáp ứng yêu cầu về tính cụ thể cho từng mục đích.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e74bbebe-2e50-43f5-92ef-92f1675b58c7', v_m_m4_i_03, 'M4-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Giải thích được những cách thức để tránh những sự đe dọa liên quan đến việc sử dụng công nghệ số đối với sức khỏe thể chất và tinh thần

- Lựa chọn được cách thức bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số

- Thảo luận về những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b3eae943-bc85-4561-b904-fa8ffac8ed1a', v_m_m4_i_03, 'M4-I-03-02', 'Định nghĩa', 'TEXT', '- An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số

- Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử

- Làm việc theo khối thời gian (time blocking): kỹ thuật dành các khoảng thời gian cố định trong lịch cho từng loại công việc cụ thể, giảm việc chuyển đổi liên tục giữa các nhiệm vụ

- Chi phí chuyển đổi ngữ cảnh: thời gian và năng lượng tinh thần bị mất khi chuyển đổi qua lại giữa các công việc khác nhau

- Kiệt sức nghề nghiệp (burnout): trạng thái kiệt quệ về thể chất và tinh thần do căng thẳng công việc kéo dài', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('00bc9e78-3427-42ac-9408-ebe9d00b8857', v_m_m4_i_03, 'M4-I-03-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc bảo vệ sức khỏe và an sinh số mở rộng sang quản lý thói quen làm việc bền vững. Quản lý thông báo hiệu quả bắt đầu từ việc phân loại: thông báo nào cần phản hồi ngay, thông báo nào có thể gộp lại kiểm tra theo khung giờ cố định.

Làm việc theo khối thời gian giúp tránh chi phí chuyển đổi ngữ cảnh — năng suất giảm mỗi lần bị gián đoạn. Dấu hiệu kiệt sức cần được nhận biết sớm: mệt mỏi kéo dài, mất hứng thú với công việc, dễ cáu gắt. Xây dựng quy ước nhóm rõ ràng về thời gian phản hồi kỳ vọng giúp giảm áp lực ngầm về việc phải phản hồi ngay lập tức ngoài giờ.

Đa nhiệm liên tục — cố gắng làm nhiều việc cùng lúc như vừa họp vừa trả lời email vừa nhắn tin — tạo cảm giác bận rộn nhưng thực chất làm giảm chất lượng và tốc độ hoàn thành công việc so với làm tuần tự từng việc, vì mỗi lần chuyển đổi đều phát sinh chi phí chuyển đổi ngữ cảnh nêu trên.

Ở mức này, việc thảo luận về công nghệ số giúp tăng cường thịnh vượng xã hội cần gắn với bối cảnh công việc cụ thể hơn — ví dụ đánh giá xem công cụ theo dõi khối lượng công việc nhóm có giúp phát hiện sớm dấu hiệu quá tải của đồng nghiệp không, hoặc kênh giao tiếp nội bộ có tạo không gian để nhân viên chia sẻ khó khăn và nhận hỗ trợ kịp thời không. Việc chọn lựa công cụ số có chủ đích cho mục đích này khác với việc chỉ dùng công nghệ theo thói quen.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('900f1e6a-09ac-4d66-ae72-40025a366c81', v_m_m4_i_03, 'M4-I-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Theo dõi thói quen số trong 3 ngày làm việc (ghi lại: số lần bị ngắt quãng bởi thông báo, thời gian phản hồi công việc ngoài giờ nếu có), phân tích và đề xuất quy ước cho nhóm.

Sản phẩm nộp: Nhật ký theo dõi 3 ngày, phân tích, dự thảo quy ước nhóm.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6b8e59dd-d1fb-46d4-9c2b-daefea26e828', v_m_m4_i_03, 'M4-I-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Chi phí chuyển đổi ngữ cảnh là gì? A. Chi phí mua phần mềm mới B. Thời gian và năng lượng mất khi chuyển đổi qua lại giữa các công việc khác nhau C. Chi phí đào tạo nhân viên D. Không có khái niệm này Đáp án: B — Đây là hiện tượng năng suất giảm mỗi khi phải chuyển đổi sự tập trung giữa các nhiệm vụ.

2. Làm việc theo khối thời gian có lợi ích gì? A. Không có lợi ích cụ thể B. Giảm chi phí chuyển đổi ngữ cảnh, tăng khả năng tập trung sâu C. Chỉ phù hợp với công việc đơn giản D. Làm chậm tiến độ công việc Đáp án: B — Dành thời gian liên tục cho một việc giúp tránh gián đoạn và tăng hiệu quả.

3. Dấu hiệu nào có thể cho thấy một người đang kiệt sức nghề nghiệp? A. Năng suất làm việc tăng đều B. Mệt mỏi kéo dài không hồi phục, mất hứng thú với công việc C. Luôn vui vẻ và năng động D. Không có dấu hiệu cụ thể nào Đáp án: B — Đây là các dấu hiệu điển hình cần được chú ý và can thiệp sớm.

4. Vì sao nên xây dựng quy ước nhóm về thời gian phản hồi? A. Không cần thiết B. Giảm áp lực ngầm về kỳ vọng phản hồi tức thời ngoài giờ C. Chỉ để có văn bản chính thức D. Làm chậm công việc nhóm Đáp án: B — Quy ước rõ ràng giúp mọi người không cảm thấy áp lực phải phản hồi ngay lập tức mọi lúc.

5. Đa nhiệm liên tục (làm nhiều việc cùng lúc) thường dẫn đến điều gì? A. Tăng chất lượng công việc B. Giảm chất lượng và tốc độ hoàn thành so với làm tuần tự C. Không ảnh hưởng gì đến hiệu suất D. Luôn hiệu quả hơn làm từng việc Đáp án: B — Nghiên cứu về năng suất cho thấy đa nhiệm liên tục thường làm giảm hiệu quả thực tế dù tạo cảm giác bận rộn.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5cb5fff8-708d-4ec7-a63c-d8565db30864', v_m_m4_i_04, 'M4-I-04-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận về các cách thức bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a6573044-8626-4e1e-92c3-4a9af284b043', v_m_m4_i_04, 'M4-I-04-02', 'Định nghĩa', 'TEXT', '- Kiểm kê tác động số: quá trình liệt kê và đánh giá mức độ tiêu thụ tài nguyên số (lưu trữ, thiết bị, in ấn) của một bộ phận hoặc tổ chức

- Dữ liệu quá hạn: dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ, gây lãng phí tài nguyên', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6df45d90-14d6-4f4d-9e8d-b1b10d1829da', v_m_m4_i_04, 'M4-I-04-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc bảo vệ môi trường khỏi tác động công nghệ số mở rộng sang vận hành số bền vững ở cấp bộ phận. Kiểm kê tác động số của bộ phận là bước đầu để tối ưu: xác định dung lượng lưu trữ, số lượng thiết bị, khối lượng in ấn.

Tối ưu lưu trữ bao gồm loại bỏ dữ liệu trùng lặp, các bản sao không cần thiết, và dữ liệu quá hạn. Xây dựng quy trình ít giấy đòi hỏi ưu tiên ký số thay vì in ra ký tay. Khi mua sắm thiết bị mới, tiêu chí bền vững có thể bao gồm độ bền, khả năng nâng cấp, và chính sách thu hồi tái chế của nhà sản xuất.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f5b4e5d7-30e8-4c62-99a6-ddd3028e7451', v_m_m4_i_04, 'M4-I-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Kiểm kê tài nguyên số của bộ phận (dung lượng lưu trữ, tài liệu trùng lặp, lượng in ấn trong một tháng), đề xuất kế hoạch tối ưu và ước tính tác động.

Sản phẩm nộp: Báo cáo kiểm kê và kế hoạch tối ưu.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a77c043c-d18c-4681-9214-0cd0cf3a2f80', v_m_m4_i_04, 'M4-I-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bước đầu tiên để tối ưu tài nguyên số của một bộ phận là gì? A. Mua thiết bị mới ngay B. Kiểm kê hiện trạng để có cơ sở đặt mục tiêu cụ thể C. Xóa toàn bộ dữ liệu cũ ngay lập tức D. Không cần bước chuẩn bị nào Đáp án: B — Kiểm kê cho dữ liệu cụ thể để đặt mục tiêu cải thiện, thay vì hành động chung chung.

2. Dữ liệu quá hạn là gì? A. Dữ liệu mới được tạo B. Dữ liệu không còn cần thiết cho mục đích ban đầu nhưng vẫn được lưu trữ C. Dữ liệu đang được sử dụng tích cực D. Dữ liệu đã được sao lưu Đáp án: B — Đây là loại dữ liệu cần được rà soát và loại bỏ để tối ưu tài nguyên lưu trữ.

3. Tiêu chí bền vững khi mua sắm thiết bị mới có thể bao gồm gì? A. Chỉ quan tâm giá rẻ nhất B. Độ bền, khả năng nâng cấp, hiệu suất năng lượng, chính sách tái chế C. Chỉ quan tâm thương hiệu nổi tiếng D. Không có tiêu chí đặc biệt nào Đáp án: B — Đây là các yếu tố giúp đánh giá tính bền vững của việc mua sắm thiết bị.

4. Vì sao nên ưu tiên ký số thay vì in ra ký tay khi có thể? A. Không có lý do cụ thể B. Giảm nhu cầu in ấn, góp phần vận hành ít giấy hơn C. Ký số luôn có giá trị pháp lý cao hơn D. Chỉ để tiết kiệm thời gian Đáp án: B — Đây là một cách thực hành cụ thể để giảm sử dụng giấy trong công việc hàng ngày.

5. Truyền thông nội bộ về thực hành bền vững có tác dụng gì? A. Không có tác dụng thực tế B. Duy trì động lực thay đổi thói quen lâu dài C. Chỉ để báo cáo hình thức D. Làm chậm công việc của bộ phận Đáp án: B — Chia sẻ kết quả và ghi nhận nỗ lực giúp duy trì sự thay đổi bền vững thay vì chỉ là hoạt động một lần.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('495d11d9-7b2e-4c76-83f5-17a2216f9f75', v_m_m4_a_01, 'M4-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Chọn lựa được cách bảo vệ phù hợp nhất cho thiết bị và nội dung số

- Phân biệt được rủi ro và mối đe dọa trong môi trường số

- Chọn lựa được các biện pháp an toàn và bảo mật phù hợp nhất

- Đánh giá được các biện pháp để quan tâm đến mức độ tin cậy và quyền riêng tư một cách phù hợp nhất', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7f8d0a5f-6677-416b-914f-55765f062c9f', v_m_m4_a_01, 'M4-A-01-02', 'Định nghĩa', 'TEXT', '- Thiết bị số (Điều 2, TT 02/2025/TT-BGDĐT): thiết bị điện tử, máy tính, viễn thông, truyền dẫn, thu phát sóng vô tuyến điện và thiết bị tích hợp khác được sử dụng để sản xuất, truyền đưa, thu thập, xử lý, lưu trữ và trao đổi thông tin số

- Đánh giá rủi ro an toàn thông tin: quá trình xác định các mối đe dọa, khả năng xảy ra và mức độ tác động lên hệ thống thông tin của tổ chức

- Kế hoạch khôi phục hoạt động: kế hoạch xác định cách tổ chức tiếp tục hoạt động và khôi phục hệ thống sau một sự cố nghiêm trọng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bae8e4f5-202b-4d70-beba-107ac74030ce', v_m_m4_a_01, 'M4-A-01-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc chọn lựa cách bảo vệ phù hợp nhất cho thiết bị và nội dung số mở rộng thành quản trị an toàn thông tin cấp doanh nghiệp — đánh giá rủi ro cần xem xét toàn diện: hệ thống nào quan trọng nhất, mối đe dọa nào có khả năng xảy ra cao.

Sổ rủi ro tổng hợp các rủi ro đã xác định, với bốn lựa chọn xử lý: tránh, giảm, chuyển, chấp nhận. Chính sách an toàn thông tin cấp tổ chức cần nêu rõ phạm vi, vai trò trách nhiệm, và chế tài khi vi phạm. Rủi ro từ nhà cung cấp và bên thứ ba cần được đánh giá riêng vì an toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan.

Phần lớn sự cố bảo mật trong thực tế bắt nguồn từ lỗi con người — bấm nhầm liên kết lừa đảo, dùng mật khẩu yếu, cấu hình sai quyền truy cập — nhiều hơn là từ tấn công kỹ thuật tinh vi. Đây là lý do chương trình đào tạo nhận thức an toàn định kỳ cho toàn thể nhân viên là một biện pháp phòng ngừa quan trọng ngang với đầu tư công nghệ.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d387c581-2525-4fb4-8d18-d96df590c643', v_m_m4_a_01, 'M4-A-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây bộ hồ sơ quản trị an toàn cho doanh nghiệp: sổ rủi ro tối thiểu 8 mục có chấm điểm (dùng bảng mẫu dưới), ma trận phân quyền, quy trình ứng phó sự cố.

Bảng mẫu sổ rủi ro (điền theo tình huống thật của doanh nghiệp):

Sản phẩm nộp: Sổ rủi ro, ma trận phân quyền, quy trình ứng phó, kế hoạch đào tạo.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a04e96d2-00d6-4692-9922-8e3264db82db', v_m_m4_a_01, 'M4-A-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bốn lựa chọn xử lý rủi ro trong quản trị an toàn thông tin là gì? A. Tránh, giảm, chuyển, chấp nhận B. Xóa, sửa, thêm, giữ nguyên C. Cao, trung bình, thấp, không có D. Nhanh, chậm, tức thời, định kỳ Đáp án: A — Đây là bốn cách tiếp cận chuẩn để xử lý một rủi ro đã xác định.

2. Điểm hở bảo mật phổ biến nhất trong thực tế thường liên quan đến điều gì? A. Lỗi phần cứng B. Quyền truy cập không được thu hồi khi nhân sự rời đi C. Lỗi mạng D. Thiết bị quá mới Đáp án: B — Đây là một trong những nguyên nhân phổ biến nhất gây rò rỉ an toàn thông tin trong tổ chức.

3. Vì sao cần đánh giá rủi ro từ nhà cung cấp và bên thứ ba? A. Không cần thiết B. An toàn thông tin của tổ chức phụ thuộc một phần vào an toàn của các bên liên quan C. Chỉ cần quan tâm hệ thống nội bộ D. Nhà cung cấp luôn an toàn tuyệt đối Đáp án: B — Bên thứ ba có quyền truy cập hệ thống cũng là một nguồn rủi ro cần được quản lý.

4. Phần lớn sự cố bảo mật bắt nguồn từ đâu? A. Chỉ từ lỗi kỹ thuật thuần túy B. Lỗi con người, như bấm nhầm liên kết hoặc dùng mật khẩu yếu C. Luôn từ tấn công có chủ đích tinh vi D. Không có nguyên nhân cụ thể Đáp án: B — Đây là lý do đào tạo nhận thức an toàn cho nhân viên là biện pháp phòng ngừa quan trọng.

5. “Chấp nhận rủi ro” trong quản trị an toàn thông tin nghĩa là gì? A. Bỏ qua rủi ro mà không xem xét B. Quyết định có chủ đích không hành động khi chi phí phòng ngừa vượt lợi ích, được ghi nhận rõ ràng C. Luôn là lựa chọn sai D. Không áp dụng được trong thực tế Đáp án: B — Chấp nhận là một lựa chọn hợp lý khi được cân nhắc và ghi nhận có chủ đích, khác với việc bỏ qua không xem xét.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('59b68cbe-cda8-4883-9c71-0bb88f506288', v_m_m4_a_02, 'M4-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Chọn lựa cách thức phù hợp nhất để bảo vệ dữ liệu cá nhân và quyền riêng tư trong môi trường số

- Đánh giá cách thức phù hợp nhất để sử dụng và chia sẻ thông tin định danh cá nhân

- Đánh giá mức độ phù hợp của các tuyên bố trong chính sách quyền riêng tư về cách sử dụng dữ liệu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b54b46b7-a051-49e8-95d4-9ae010f40630', v_m_m4_a_02, 'M4-A-02-02', 'Định nghĩa', 'TEXT', '- Bản đồ luồng dữ liệu: tài liệu mô tả dữ liệu cá nhân được thu thập ở đâu, lưu trữ ở đâu, ai truy cập, và được chuyển giao cho ai

- Đánh giá tác động xử lý dữ liệu cá nhân: quá trình phân tích rủi ro khi xử lý dữ liệu cá nhân quy mô lớn hoặc dữ liệu nhạy cảm, nhằm giảm thiểu rủi ro trước khi triển khai

- Bên xử lý dữ liệu: tổ chức hoặc cá nhân xử lý dữ liệu cá nhân thay mặt cho bên kiểm soát dữ liệu theo hợp đồng hoặc thỏa thuận', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f82d3a84-e972-40d4-819c-4d19c03b8209', v_m_m4_a_02, 'M4-A-02-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc bảo vệ dữ liệu cá nhân mở rộng thành chương trình tuân thủ cấp tổ chức, căn cứ theo cả Nghị định 13/2023/NĐ-CP (có hiệu lực từ 1/7/2023) và Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 (hiệu lực từ 1/1/2026). Lập bản đồ luồng dữ liệu cá nhân là bước nền tảng: xác định dữ liệu thu thập ở đâu, lưu trữ ở đâu, ai có quyền truy cập, có chuyển giao cho bên thứ ba nào không.

Đánh giá tác động xử lý dữ liệu cá nhân nên được thực hiện khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm. Quy trình tiếp nhận và xử lý yêu cầu của chủ thể dữ liệu cần có kênh tiếp nhận rõ ràng và thời hạn xử lý xác định, cùng nghĩa vụ thông báo sự cố trong 72 giờ theo quy định.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0edda688-9b1b-45c9-804e-24fe98fa7884', v_m_m4_a_02, 'M4-A-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Lập bản đồ luồng dữ liệu cá nhân cho một quy trình nghiệp vụ thật của doanh nghiệp (ví dụ: quy trình từ khách hàng đăng ký đến hoàn tất đơn hàng), xác định các điểm rủi ro tuân thủ và đề xuất biện pháp khắc phục.

Sản phẩm nộp: Bản đồ luồng dữ liệu, đánh giá tuân thủ, kế hoạch khắc phục.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b265c080-2001-49f0-ac0e-252d3625ce85', v_m_m4_a_02, 'M4-A-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Nghị định 13/2023/NĐ-CP có hiệu lực từ khi nào? A. 1/1/2023 B. 1/7/2023 C. 1/1/2024 D. 1/7/2024 Đáp án: B — Nghị định 13/2023/NĐ-CP có hiệu lực thi hành từ ngày 1/7/2023.

2. Bản đồ luồng dữ liệu cần thể hiện những thông tin gì? A. Chỉ cần biết dữ liệu tồn tại B. Dữ liệu thu thập ở đâu, lưu ở đâu, ai truy cập, chuyển giao cho ai C. Chỉ cần biết số lượng bản ghi D. Chỉ cần biết định dạng tệp Đáp án: B — Đây là các thông tin cốt lõi cần có trong một bản đồ luồng dữ liệu đầy đủ.

3. Khi nào nên thực hiện đánh giá tác động xử lý dữ liệu cá nhân? A. Không bao giờ cần thiết B. Khi triển khai xử lý dữ liệu quy mô lớn hoặc dữ liệu nhạy cảm C. Chỉ khi có sự cố xảy ra D. Chỉ áp dụng cho doanh nghiệp nước ngoài Đáp án: B — Đánh giá trước khi triển khai giúp giảm thiểu rủi ro chủ động thay vì xử lý sau sự cố.

4. Vì sao cần có hợp đồng rõ ràng với bên xử lý dữ liệu bên ngoài? A. Không cần thiết nếu tin tưởng đối tác B. Quy định rõ trách nhiệm bảo vệ dữ liệu, không chỉ dựa vào lòng tin C. Chỉ để tăng chi phí hợp đồng D. Chỉ cần thỏa thuận miệng Đáp án: B — Hợp đồng rõ ràng là căn cứ pháp lý và thực tiễn để đảm bảo bên xử lý tuân thủ đúng yêu cầu.

5. Chuyển dữ liệu cá nhân ra nước ngoài (ví dụ lưu trên máy chủ đám mây quốc tế) cần lưu ý điều gì? A. Không cần lưu ý gì đặc biệt B. Có yêu cầu riêng theo quy định hiện hành tại Việt Nam, nên tham vấn pháp lý cụ thể C. Luôn bị cấm hoàn toàn D. Chỉ áp dụng cho dữ liệu công khai Đáp án: B — Đây là điểm có yêu cầu riêng biệt cần được tư vấn pháp lý cụ thể trước khi triển khai.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5b00cb03-5193-4921-aaff-654e3077f93b', v_m_m4_a_03, 'M4-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được cách thức phù hợp nhất để tránh rủi ro và đe dọa đến sức khỏe thể chất và tinh thần khi sử dụng công nghệ số

- Vận dụng được cách thức phù hợp nhất để bảo vệ bản thân và người khác khỏi nguy cơ trong môi trường số

- Linh hoạt trong cách sử dụng những công nghệ số giúp tăng cường thịnh vượng xã hội và sự hòa hợp trong xã hội', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('090e8d1c-1e3b-4ef9-90cc-01224826a302', v_m_m4_a_03, 'M4-A-03-02', 'Định nghĩa', 'TEXT', '- An sinh số (Điều 2, TT 02/2025/TT-BGDĐT): trạng thái cân bằng giữa việc sử dụng công nghệ số và sức khỏe tinh thần, thể chất của người dùng trong việc sử dụng phương tiện kỹ thuật số

- Bắt nạt trên mạng (Điều 2, TT 02/2025/TT-BGDĐT): những hành vi có chủ đích xấu được tiến hành bởi một người hoặc một nhóm người lên một cá nhân bằng cách đe dọa, xâm hại, làm nhục, làm ảnh hưởng, xúc phạm danh dự, nhân phẩm hoặc tra tấn tinh thần thông qua tin nhắn, mạng Internet, các trang mạng xã hội và qua các thiết bị điện tử

- Quyền ngắt kết nối: khái niệm về quyền của nhân viên được không phải phản hồi công việc ngoài giờ làm việc đã thỏa thuận

- Khả năng tiếp cận (accessibility): mức độ công cụ và tài liệu số có thể được sử dụng bởi người có những khả năng khác nhau, bao gồm người khuyết tật', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('594adb22-f73a-4ffd-8fb4-eeb8c938f710', v_m_m4_a_03, 'M4-A-03-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc bảo vệ sức khỏe và an sinh số mở rộng thành chính sách an sinh số cấp tổ chức. Khảo sát trải nghiệm làm việc số của nhân viên định kỳ giúp tổ chức nắm bắt vấn đề trước khi trở nên nghiêm trọng.

Nguyên nhân quá tải có tính hệ thống thường không nằm ở cá nhân mà ở cách tổ chức vận hành: quá nhiều kênh giao tiếp, quá nhiều cuộc họp. Chính sách về thời gian phản hồi và quyền ngắt kết nối nên được văn bản hóa chính thức. Khả năng tiếp cận trong công cụ và tài liệu số đảm bảo mọi nhân viên, bao gồm người khuyết tật, đều có thể tham gia công việc số một cách bình đẳng.

Chính sách chỉ có tác dụng thực tế khi cấp quản lý làm gương — nếu quản lý vẫn nhắn tin công việc ngoài giờ hoặc trả lời email lúc nửa đêm, chính sách “tôn trọng ranh giới thời gian” trên văn bản sẽ mất hiệu lực, vì nhân viên quan sát và học theo hành vi thực tế của cấp trên nhiều hơn là đọc quy định trên giấy.

Ở mức lãnh đạo, việc linh hoạt sử dụng công nghệ số để tăng cường thịnh vượng xã hội đòi hỏi chủ động tích hợp các công cụ hỗ trợ sức khỏe tinh thần vào chính sách nhân sự — ví dụ cung cấp quyền truy cập ứng dụng chăm sóc sức khỏe tinh thần cho nhân viên, xây kênh nội bộ ẩn danh để nhân viên chia sẻ khó khăn, hoặc tổ chức các hoạt động kết nối trực tuyến cho đội ngũ làm việc từ xa. Đây là phần bổ sung cho các chính sách phòng ngừa rủi ro đã nêu ở trên, thể hiện vai trò chủ động thay vì chỉ đối phó khi có vấn đề phát sinh.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9526e7ae-5adb-4636-81a2-c10831d474cc', v_m_m4_a_03, 'M4-A-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Khảo sát trải nghiệm làm việc số trong doanh nghiệp (thiết kế bộ câu hỏi ngắn 8–10 câu về quá tải thông tin, chất lượng họp, ranh giới thời gian), phân tích kết quả và soạn dự thảo chính sách phúc lợi số.

Sản phẩm nộp: Kết quả khảo sát, phân tích, dự thảo chính sách.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f4365b45-73bc-449d-a9f0-27e4606d1bab', v_m_m4_a_03, 'M4-A-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Nguyên nhân quá tải có tính hệ thống thường xuất phát từ đâu? A. Chỉ từ năng lực cá nhân của từng nhân viên B. Cách tổ chức vận hành: quá nhiều kênh, quá nhiều họp, kỳ vọng phản hồi tức thời C. Không có nguyên nhân hệ thống nào D. Chỉ do thiết bị lỗi thời Đáp án: B — Vấn đề quá tải thường mang tính hệ thống hơn là vấn đề cá nhân.

2. Vì sao chính sách về quyền ngắt kết nối nên được văn bản hóa chính thức? A. Không cần thiết, thỏa thuận ngầm là đủ B. Giúp nhân viên có căn cứ rõ ràng để bảo vệ thời gian nghỉ ngơi C. Chỉ để tuân thủ hình thức D. Không có tác dụng thực tế Đáp án: B — Văn bản chính thức tạo căn cứ vững chắc hơn thỏa thuận ngầm không rõ ràng.

3. Khả năng tiếp cận (accessibility) trong công cụ số liên quan đến điều gì? A. Chỉ liên quan đến tốc độ tải trang B. Mức độ công cụ có thể được sử dụng bởi người có khả năng khác nhau, bao gồm người khuyết tật C. Chỉ liên quan đến giao diện đẹp D. Không quan trọng trong môi trường doanh nghiệp Đáp án: B — Đây là yếu tố đảm bảo tính bình đẳng trong tiếp cận công cụ số.

4. Vai trò làm gương của cấp quản lý ảnh hưởng thế nào đến chính sách phúc lợi số? A. Không ảnh hưởng gì B. Quyết định hiệu quả thực tế của chính sách — hành vi thực tế quan trọng hơn văn bản C. Chỉ ảnh hưởng đến nhân viên mới D. Không liên quan đến phúc lợi số Đáp án: B — Nếu quản lý không tuân thủ chính sách, chính sách sẽ mất hiệu lực thực tế dù có trên giấy.

5. Cuộc họp nào nên được cân nhắc thay bằng email hoặc kênh khác? A. Cuộc họp cần thảo luận, trao đổi ý kiến qua lại B. Cuộc họp chỉ nhằm thông báo một chiều không cần trao đổi C. Cuộc họp ra quyết định quan trọng D. Cuộc họp giải quyết xung đột Đáp án: B — Thông báo một chiều có thể truyền đạt hiệu quả qua kênh không đồng bộ như email, tiết kiệm thời gian họp.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c402c418-08b9-4256-9f99-e0b7ddc37a9f', v_m_m4_a_04, 'M4-A-04-01', 'Mục tiêu học tập', 'TEXT', '- Chọn lựa được giải pháp phù hợp nhất để bảo vệ môi trường khỏi tác động của công nghệ số và việc sử dụng công nghệ', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f0959b6e-b7de-43ec-ad53-cbb7410feaaa', v_m_m4_a_04, 'M4-A-04-02', 'Định nghĩa', 'TEXT', '- Chỉ tiêu bền vững: thước đo cụ thể, đo lường được, dùng để theo dõi tiến độ hướng tới mục tiêu bền vững đã đặt ra

- Vòng đời thiết bị (từ góc độ chính sách): chu trình mua, sử dụng, sửa chữa, và thanh lý thiết bị được quản lý có chủ đích ở cấp tổ chức', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3b5a40fd-2f53-40f0-9d72-0251bba9bdcc', v_m_m4_a_04, 'M4-A-04-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc chọn giải pháp phù hợp nhất để bảo vệ môi trường mở rộng thành chiến lược bền vững số cấp toàn doanh nghiệp. Kiểm kê tác động số toàn doanh nghiệp bao gồm tổng dung lượng lưu trữ, tuổi thọ trung bình thiết bị, mức tiêu thụ năng lượng hạ tầng công nghệ thông tin.

Chỉ tiêu bền vững cần cụ thể và đo lường được, ví dụ “giảm 20% khối lượng in ấn trong năm tới”. Tiêu chí bền vững trong mua sắm nên được đưa vào chính thức trong quy trình lựa chọn nhà cung cấp. Báo cáo kết quả bền vững cần dựa trên số liệu thực tế đã đo lường, tránh công bố phóng đại.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a5ef5ecd-eae6-4551-ac6a-db4e11cf80ae', v_m_m4_a_04, 'M4-A-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây chiến lược bền vững số cho doanh nghiệp: kiểm kê hiện trạng, ba mục tiêu có chỉ tiêu đo được, kế hoạch triển khai, và khung báo cáo.

Sản phẩm nộp: Chiến lược bền vững số, bộ chỉ tiêu, khung báo cáo.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d491c280-5477-4343-bdbe-ce396aa23486', v_m_m4_a_04, 'M4-A-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Chỉ tiêu bền vững tốt cần có đặc điểm gì? A. Chung chung, dễ đạt được B. Cụ thể và đo lường được C. Không cần đo lường D. Chỉ cần có ý định tốt Đáp án: B — Chỉ tiêu cụ thể, đo lường được mới giúp theo dõi tiến độ hiệu quả.

2. Xác định điểm can thiệp có tác động lớn nhất giúp ích gì? A. Không có lợi ích cụ thể B. Tập trung nguồn lực vào nơi mang lại hiệu quả cao nhất C. Chỉ để báo cáo đẹp hơn D. Làm phức tạp thêm quy trình Đáp án: B — Tập trung vào điểm có tác động lớn giúp sử dụng nguồn lực hiệu quả hơn dàn trải.

3. Vì sao không nên công bố kết quả bền vững phóng đại? A. Không có vấn đề gì nếu không ai phát hiện B. Là rủi ro uy tín nếu bị phát hiện không đúng thực tế, ngoài vấn đề đạo đức C. Không liên quan đến uy tín doanh nghiệp D. Luôn được chấp nhận trong marketing Đáp án: B — Công bố sai lệch có thể gây tổn hại nghiêm trọng đến uy tín khi bị phát hiện.

4. Chính sách vòng đời thiết bị ở cấp tổ chức nên ưu tiên điều gì trước khi thay mới? A. Thay mới ngay khi có phiên bản mới hơn B. Ưu tiên sửa chữa trước khi thay mới C. Không cần chính sách cụ thể D. Thay mới toàn bộ đồng loạt mỗi năm Đáp án: B — Ưu tiên sửa chữa giúp kéo dài vòng đời thiết bị và giảm rác thải điện tử.

5. Tiêu chí bền vững khi chọn nhà cung cấp dịch vụ đám mây có thể bao gồm gì? A. Chỉ quan tâm giá rẻ nhất B. Cam kết năng lượng tái tạo và hiệu suất năng lượng của trung tâm dữ liệu C. Không có tiêu chí liên quan đến bền vững D. Chỉ quan tâm tốc độ truy cập Đáp án: B — Đây là các yếu tố phản ánh mức độ bền vững của nhà cung cấp dịch vụ đám mây.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('95caa19e-052e-4e71-9195-c1052b02a2ec', v_m_m5_f_01, 'M5-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị và sử dụng môi trường số

- Xác định được các giải pháp đơn giản để giải quyết chúng', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bc502e6e-58ad-424d-8d3e-a8d0224d4500', v_m_m5_f_01, 'M5-F-01-02', 'Định nghĩa', 'TEXT', '- Sự cố kỹ thuật: tình huống một thiết bị hoặc phần mềm không hoạt động như mong đợi

- Thông báo lỗi: dòng chữ hệ thống hiển thị khi có sự cố, thường gợi ý nguyên nhân hoặc mã lỗi cụ thể', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1a291d82-c9e3-4ccc-9dcf-1e6a4cb79ca5', v_m_m5_f_01, 'M5-F-01-03', 'Nội dung', 'TEXT', 'Giải quyết các vấn đề kỹ thuật nghĩa là xác định được các vấn đề kỹ thuật đơn giản khi vận hành thiết bị số và sử dụng môi trường số. Mô tả sự cố chính xác là bước đầu tiên: đang làm gì khi sự cố xảy ra, điều gì đã xảy ra khác với mong đợi, có thông báo lỗi cụ thể nào không.

Các bước xử lý cơ bản theo thứ tự nên thử: khởi động lại ứng dụng hoặc thiết bị, kiểm tra kết nối mạng, kiểm tra bản cập nhật. Khi đã thử các bước cơ bản mà không giải quyết được, nên dừng tự xử lý và báo bộ phận kỹ thuật, cung cấp đầy đủ mô tả sự cố và các bước đã thử.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('47aa2d60-b2ad-4213-8ab3-adde12d52080', v_m_m5_f_01, 'M5-F-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Với 5 tình huống sự cố mô phỏng dưới đây, viết mô tả sự cố đúng chuẩn và liệt kê các bước sẽ thử theo thứ tự.

5 tình huống mẫu:

- Máy in không in được, đèn báo nhấp nháy màu vàng

- Không mở được một file PDF, hiện thông báo “file bị hỏng”

- Không kết nối được wifi công ty dù các thiết bị khác vẫn kết nối bình thường

- Trình duyệt web chạy rất chậm khi mở nhiều tab

- Không đăng nhập được vào hệ thống email công ty, báo sai mật khẩu dù chắc chắn gõ đúng

Sản phẩm nộp: Bảng 5 sự cố kèm mô tả chuẩn và các bước xử lý theo thứ tự.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('def8b530-60ab-43e8-974a-7072d7908749', v_m_m5_f_01, 'M5-F-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Một mô tả sự cố tốt cần trả lời những câu hỏi nào? A. Chỉ cần nói “bị lỗi” là đủ B. Đang làm gì, điều gì xảy ra khác mong đợi, có thông báo lỗi cụ thể không C. Chỉ cần biết tên thiết bị D. Không cần mô tả gì, chỉ cần gọi hỗ trợ Đáp án: B — Đây là ba yếu tố giúp mô tả sự cố đủ thông tin để xử lý hiệu quả.

2. Bước xử lý cơ bản nào thường giải quyết được nhiều sự cố đơn giản nhất? A. Mua thiết bị mới B. Khởi động lại ứng dụng hoặc thiết bị C. Gọi ngay bộ phận kỹ thuật D. Không làm gì và chờ tự hết Đáp án: B — Khởi động lại giải quyết được rất nhiều sự cố phổ biến do lỗi tạm thời.

3. Khi gặp thông báo lỗi cụ thể, cách hiệu quả để tìm giải pháp là gì? A. Bỏ qua thông báo lỗi B. Tra cứu nguyên văn thông báo lỗi đó C. Khởi động lại máy nhiều lần D. Không có cách nào hiệu quả Đáp án: B — Thông báo lỗi cụ thể thường đã được nhiều người khác gặp và có hướng dẫn xử lý sẵn.

4. Khi báo cáo sự cố cho bộ phận kỹ thuật, thông tin nào nên cung cấp? A. Chỉ cần nói “máy bị lỗi” B. Mô tả sự cố, các bước đã thử, thông báo lỗi cụ thể nếu có C. Không cần cung cấp thông tin gì D. Chỉ cần tên người dùng Đáp án: B — Thông tin đầy đủ giúp bộ phận hỗ trợ xử lý nhanh và chính xác hơn.

5. Vì sao nên ghi lại cách đã xử lý thành công một sự cố? A. Không cần thiết B. Để lần sau gặp lại có thể tự xử lý nhanh hơn C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi chép giúp xây dựng kinh nghiệm cá nhân, tiết kiệm thời gian về sau.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('25f5c2ca-9b4f-48ad-8c02-8fd773f8cc24', v_m_m5_f_02, 'M5-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được nhu cầu cá nhân

- Nhận ra được các công cụ số đơn giản và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó

- Chọn được những cách đơn giản để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9a184847-920e-44d6-8149-087625fd7f95', v_m_m5_f_02, 'M5-F-02-02', 'Định nghĩa', 'TEXT', '- Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra

- Nhu cầu công việc: mô tả cụ thể về việc cần làm, kết quả mong muốn, và ai sẽ sử dụng kết quả đó

- Công cụ có sẵn của doanh nghiệp: phần mềm hoặc dịch vụ đã được doanh nghiệp cấp phép và phê duyệt sử dụng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5474522f-59fe-4d13-a833-1cc6211b4659', v_m_m5_f_02, 'M5-F-02-03', 'Nội dung', 'TEXT', 'Xác định nhu cầu và giải pháp công nghệ ở mức cơ bản nghĩa là xác định được nhu cầu cá nhân và nhận ra các công cụ số đơn giản có thể giải quyết nhu cầu đó. Trước khi chọn công cụ, cần xác định rõ: cần làm gì cụ thể, kết quả sẽ được dùng bởi ai.

Nên ưu tiên dùng công cụ có sẵn của doanh nghiệp trước khi tìm công cụ mới. Dấu hiệu công cụ không còn phù hợp bao gồm phải thực hiện nhiều thao tác thủ công để bù đắp, hoặc thường xuyên xảy ra sai sót. Trước khi đưa dữ liệu công việc lên bất kỳ công cụ mới nào, nên hỏi ý kiến người phụ trách hoặc bộ phận IT.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('750749e5-c66a-4a41-a8b4-aba0e95474ab', v_m_m5_f_02, 'M5-F-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Liệt kê 5 công việc thường làm trong tuần, xác định công cụ đang dùng cho mỗi việc và đánh giá mức độ phù hợp.

Bảng mẫu:

Sản phẩm nộp: Bảng công việc – công cụ – đánh giá phù hợp (5 dòng).', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('61b5872e-ff0f-40a5-86bf-55a94a42089d', v_m_m5_f_02, 'M5-F-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Bước đầu tiên trước khi chọn công cụ cho một công việc là gì? A. Chọn công cụ phổ biến nhất B. Xác định rõ nhu cầu: cần làm gì, kết quả dùng bởi ai C. Hỏi đồng nghiệp dùng gì D. Không cần bước chuẩn bị nào Đáp án: B — Hiểu rõ nhu cầu giúp chọn đúng công cụ, tránh phải làm lại.

2. Vì sao nên ưu tiên công cụ có sẵn của doanh nghiệp? A. Không có lý do đặc biệt B. Đã được phê duyệt về bảo mật, dễ hợp tác với đồng nghiệp C. Luôn miễn phí D. Không cần lý do gì Đáp án: B — Công cụ có sẵn đảm bảo tính nhất quán và an toàn hơn công cụ tự tìm bên ngoài.

3. Dấu hiệu nào cho thấy công cụ đang dùng không còn phù hợp? A. Công việc hoàn thành nhanh chóng, chính xác B. Phải thực hiện nhiều thao tác thủ công lặp lại để bù đắp thiếu sót của công cụ C. Không có vấn đề gì D. Đồng nghiệp cũng dùng công cụ đó Đáp án: B — Đây là dấu hiệu công cụ không đáp ứng đủ nhu cầu công việc thực tế.

4. Trước khi đưa dữ liệu công việc lên một công cụ mới chưa được phê duyệt, nên làm gì? A. Cứ dùng thử trước, hỏi sau B. Hỏi ý kiến người phụ trách hoặc bộ phận IT trước C. Không cần hỏi ai D. Chỉ cần thông báo sau khi đã dùng Đáp án: B — Xin phê duyệt trước giúp tránh rủi ro bảo mật và vi phạm chính sách công ty.

5. Rủi ro của việc tự ý cài công cụ ngoài không qua phê duyệt là gì? A. Không có rủi ro gì B. Có thể vi phạm chính sách bảo mật, đưa dữ liệu ra ngoài kiểm soát C. Chỉ tốn thêm dung lượng D. Chỉ ảnh hưởng đến tốc độ máy Đáp án: B — Đây là các rủi ro thực tế cần cân nhắc trước khi tự ý dùng công cụ mới.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('4d8c6556-49b5-4f6b-84e4-88ef11a06258', v_m_m5_f_03, 'M5-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được các công cụ và công nghệ số đơn giản có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình cũng như sản phẩm

- Tuân theo quy trình nhận thức đơn giản của cá nhân và tập thể để hiểu và giải quyết các vấn đề khái niệm đơn giản và tình huống có vấn đề trong môi trường số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f8791551-f61a-4ce6-8d0b-0a8bfc830870', v_m_m5_f_03, 'M5-F-03-02', 'Định nghĩa', 'TEXT', '- Điểm mất thời gian: công đoạn trong quy trình làm việc tốn nhiều thời gian hơn mức cần thiết so với cách làm khác hiệu quả hơn

- Phím tắt: tổ hợp phím giúp thực hiện một thao tác nhanh hơn so với dùng chuột', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('085a1dc2-3fe2-4964-9b40-b9c0b7d3c7b7', v_m_m5_f_03, 'M5-F-03-03', 'Nội dung', 'TEXT', 'Sử dụng sáng tạo công nghệ số ở mức cơ bản nghĩa là xác định được các công cụ và công nghệ số đơn giản có thể dùng để tạo ra kiến thức và đổi mới quy trình. Nhận diện điểm mất thời gian trong công việc hàng ngày là bước đầu tiên.

Nhiều tính năng ít được để ý nhưng tiết kiệm đáng kể thời gian: phím tắt, mẫu tài liệu có sẵn, tìm kiếm nâng cao. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho nhiều tình huống. Khi đề xuất cải tiến với cấp trên, nên trình bày cụ thể với số liệu ước tính.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1d6f8b16-1574-45c5-9dba-36177afe670b', v_m_m5_f_03, 'M5-F-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chọn một công việc lặp lại hàng tuần, đo thời gian hiện tại đang mất, áp dụng một cải tiến (phím tắt, mẫu có sẵn, tính năng lọc/sắp xếp…) và đo lại thời gian sau khi cải tiến.

Sản phẩm nộp: Mô tả cải tiến và số liệu thời gian trước/sau (ví dụ: “Trước: 25 phút/tuần để tổng hợp báo cáo bằng cách chép tay từng dòng. Sau khi dùng tính năng lọc và công thức tổng trong Excel: 5 phút/tuần”).', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d343dfc2-5f41-45fb-8c26-a8a6bf3c2f18', v_m_m5_f_03, 'M5-F-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Phím tắt Ctrl+F thường dùng để làm gì? A. Lưu tài liệu B. Tìm kiếm nhanh trong tài liệu C. In tài liệu D. Đóng tài liệu Đáp án: B — Đây là phím tắt tìm kiếm phổ biến trong hầu hết ứng dụng văn phòng.

2. Nguyên tắc “làm một lần rồi dùng lại” áp dụng cho tình huống nào? A. Chỉ áp dụng cho công việc làm một lần duy nhất B. Tạo mẫu tài liệu hoặc danh mục kiểm tra dùng lại cho công việc hay lặp lại C. Không áp dụng được trong thực tế D. Chỉ áp dụng cho công việc phức tạp Đáp án: B — Đây là nguyên tắc tiết kiệm thời gian cho các công việc có tính lặp lại.

3. Khi đề xuất cải tiến với cấp trên, điều gì giúp đề xuất dễ được chấp thuận hơn? A. Trình bày chung chung không cần số liệu B. Có số liệu cụ thể về lợi ích ước tính (ví dụ thời gian tiết kiệm) C. Không cần giải thích gì D. Chỉ cần nói “cách này tốt hơn” Đáp án: B — Số liệu cụ thể giúp cấp trên đánh giá và ra quyết định dễ dàng hơn.

4. Vì sao nên ghi lại cách làm hiệu quả đã tìm ra? A. Không cần thiết B. Để bản thân dùng lại và có thể chia sẻ cho đồng nghiệp C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi chép giúp lan tỏa cách làm hiệu quả trong nhóm, không chỉ dừng lại ở cá nhân.

5. Điểm mất thời gian trong công việc thường được nhận diện qua đâu? A. Không thể nhận diện được B. Công việc lặp lại thường xuyên, tốn công khó chịu, hay gây sai sót C. Chỉ qua báo cáo của cấp trên D. Chỉ qua phần mềm đo lường chuyên dụng Đáp án: B — Đây là các dấu hiệu thực tế giúp nhận diện điểm cần cải tiến trong công việc hàng ngày.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9567f126-d7ed-4771-8fff-c7912d0d2f2e', v_m_m5_f_04, 'M5-F-04-01', 'Mục tiêu học tập', 'TEXT', '- Nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu

- Xác định được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('80eb0d00-93be-4962-892b-a05caec20630', v_m_m5_f_04, 'M5-F-04-02', 'Định nghĩa', 'TEXT', '- Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn

- Khoảng trống năng lực: sự chênh lệch giữa năng lực hiện tại của một người và năng lực yêu cầu cho vị trí công việc

- Kế hoạch học tập cá nhân: lộ trình cụ thể xác định kỹ năng cần học, nguồn học, và thời gian hoàn thành', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('353f23b6-3523-4131-9832-fb71d6a2284b', v_m_m5_f_04, 'M5-F-04-03', 'Nội dung', 'TEXT', 'Xác định các vấn đề cần cải thiện về năng lực số ở mức cơ bản nghĩa là nhận ra được năng lực số của bản thân cần được cải thiện hoặc cập nhật ở đâu. Năng lực số là khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc giải quyết vấn đề trong thực tiễn.

Tự đánh giá theo khung năng lực chính thức giúp có cái nhìn khách quan hơn cảm giác chủ quan. So sánh với yêu cầu của vị trí công việc cho ra khoảng trống năng lực cụ thể. Cách học hiệu quả với người đi làm: học ít nhưng đều, gắn với công việc thực tế.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a95e74c7-a8e3-4d1d-b837-a8127d5f14eb', v_m_m5_f_04, 'M5-F-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Hoàn thành bản tự đánh giá năng lực số theo 6 miền (dùng bảng mẫu dưới), so với yêu cầu vị trí công việc của mình, lập kế hoạch học tập 3 tháng.

Bảng tự đánh giá mẫu:

Sản phẩm nộp: Bản tự đánh giá và kế hoạch học tập cá nhân 3 tháng.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c6f2a063-93f0-4888-a76e-c2ab41e2ef0a', v_m_m5_f_04, 'M5-F-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Khoảng trống năng lực được xác định như thế nào? A. Không thể xác định được B. So sánh năng lực hiện tại với năng lực yêu cầu của vị trí công việc C. Chỉ dựa vào cảm giác chủ quan D. Không cần xác định cụ thể Đáp án: B — Đây là cách xác định khoảng trống năng lực một cách có căn cứ.

2. Cách học hiệu quả với người đi làm nên như thế nào? A. Dồn cả ngày cuối tuần để học B. Học ít nhưng đều đặn, gắn với công việc thực tế C. Không cần lịch trình cụ thể D. Chỉ học lý thuyết tách rời công việc Đáp án: B — Học đều đặn và áp dụng ngay giúp ghi nhớ tốt hơn và phù hợp với lịch trình người đi làm.

3. Câu hỏi nào khi nhờ đồng nghiệp hướng dẫn sẽ hiệu quả hơn? A. “Chỉ em cách dùng Excel với” B. “Làm sao để lọc dữ liệu theo điều kiện cụ thể này trong Excel?” C. Không cần đặt câu hỏi cụ thể D. Hỏi càng chung chung càng tốt Đáp án: B — Câu hỏi cụ thể giúp người hướng dẫn trả lời trực tiếp và hiệu quả hơn.

4. Vì sao nên theo dõi tiến bộ học tập của bản thân? A. Không cần thiết B. Giúp duy trì động lực học tập lâu dài C. Chỉ để báo cáo hình thức D. Không có tác dụng thực tế Đáp án: B — Ghi nhận tiến bộ giúp nhận thấy kết quả, đặc biệt khi tiến bộ khó nhận thấy trong ngắn hạn.

5. Nguồn học nào phù hợp cho người đi làm? A. Chỉ có khóa học chính quy dài hạn B. Tài liệu nội bộ, khóa học trực tuyến, học hỏi từ đồng nghiệp C. Không có nguồn học nào phù hợp D. Chỉ có thể tự học một mình Đáp án: B — Đây là các nguồn học đa dạng, linh hoạt phù hợp với lịch trình người đi làm.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('3d16f824-9eb2-4e64-b54e-418f2afbe743', v_m_m5_i_01, 'M5-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số

- Chọn được giải pháp cho chúng', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('068d6277-1f28-4cc5-b0ea-3a10b89e0f8a', v_m_m5_i_01, 'M5-I-01-02', 'Định nghĩa', 'TEXT', '- Chẩn đoán có hệ thống: phương pháp xác định nguyên nhân sự cố bằng cách loại trừ dần các khả năng, thay vì đoán ngẫu nhiên

- Sự cố cục bộ: sự cố chỉ ảnh hưởng đến một người hoặc một máy, khác với sự cố hệ thống ảnh hưởng nhiều người', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('819f86db-46f1-42c3-9b07-768306dc728f', v_m_m5_i_01, 'M5-I-01-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc phân biệt vấn đề kỹ thuật và chọn giải pháp cho chúng đòi hỏi phương pháp chẩn đoán có hệ thống gồm ba bước: tái hiện lại sự cố, thu hẹp phạm vi, loại trừ.

Phân biệt nguồn gốc vấn đề giúp xử lý đúng hướng: lỗi do thao tác, lỗi dữ liệu, lỗi phần mềm, lỗi kết nối, hoặc lỗi quyền truy cập. Phân biệt sự cố cục bộ (chỉ một người gặp) và sự cố hệ thống (nhiều người cùng gặp) là bước chẩn đoán quan trọng. Xây dựng tài liệu hướng dẫn xử lý sự cố thường gặp cho bộ phận giúp đồng nghiệp tự xử lý được các sự cố lặp lại.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('837cec0c-92fa-403d-8aca-ac6c98fddd0a', v_m_m5_i_01, 'M5-I-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chẩn đoán 3 tình huống sự cố phức tạp dưới đây, ghi lại quá trình loại trừ; xây tài liệu hướng dẫn xử lý cho 5 sự cố hay gặp nhất của bộ phận.

3 tình huống mẫu để thực hành chẩn đoán:

- Một nhân viên báo không mở được file chia sẻ chung, nhưng đồng nghiệp khác vẫn mở bình thường

- Hệ thống quản lý công việc chạy rất chậm vào buổi sáng, nhưng bình thường vào buổi chiều

- Một báo cáo tự động hàng tuần đột nhiên không còn gửi email như trước

Sản phẩm nộp: Nhật ký chẩn đoán 3 tình huống và tài liệu hướng dẫn xử lý 5 sự cố.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2c25461b-2b97-4e08-b926-88f04e272b6d', v_m_m5_i_01, 'M5-I-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Ba bước của phương pháp chẩn đoán có hệ thống là gì? A. Đoán, thử, hy vọng B. Tái hiện, thu hẹp phạm vi, loại trừ C. Báo cáo, chờ đợi, kiểm tra D. Khởi động lại, chờ, thử lại Đáp án: B — Đây là quy trình chẩn đoán có hệ thống giúp xác định nguyên nhân chính xác.

2. Một sự cố chỉ xảy ra với một người trong khi đồng nghiệp khác vẫn dùng bình thường gợi ý điều gì? A. Đây chắc chắn là sự cố hệ thống B. Nguyên nhân thường liên quan đến máy hoặc tài khoản của riêng người đó C. Không thể suy luận được gì D. Cần báo động toàn công ty ngay Đáp án: B — Sự cố cục bộ (một người) thường có nguyên nhân riêng biệt khác với sự cố hệ thống.

3. Vì sao nên ghi nhận và theo dõi các sự cố lặp lại? A. Không cần thiết B. Giúp tìm nguyên nhân gốc thay vì chỉ xử lý triệu chứng mỗi lần C. Chỉ để có báo cáo đẹp D. Không có tác dụng thực tế Đáp án: B — Sự cố lặp lại nhiều lần là dấu hiệu cần tìm và giải quyết nguyên nhân gốc.

4. Khi trao đổi với bộ phận kỹ thuật, điều gì giúp tiết kiệm thời gian? A. Chỉ nói “bị lỗi, sửa giúp em” B. Cung cấp thông tin đã chẩn đoán được và đã loại trừ những gì C. Không cần cung cấp thông tin gì D. Chỉ cần gọi điện thoại nhiều lần Đáp án: B — Thông tin đầy đủ giúp bộ phận kỹ thuật không phải lặp lại các bước cơ bản đã thử.

5. Tài liệu hướng dẫn xử lý sự cố cho bộ phận có tác dụng gì? A. Không có tác dụng thực tế B. Giúp đồng nghiệp tự xử lý sự cố lặp lại mà không cần chờ hỗ trợ mỗi lần C. Chỉ để trang trí D. Làm phức tạp thêm quy trình Đáp án: B — Tài liệu hướng dẫn giúp tăng khả năng tự xử lý của cả bộ phận, giảm phụ thuộc vào hỗ trợ bên ngoài.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e7195674-20e1-4c9d-8d56-54fe1f6aa7da', v_m_m5_i_02, 'M5-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Giải thích nhu cầu cá nhân

- Lựa chọn được các công cụ số và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó

- Chọn được cách điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1fa43848-0214-48b3-accc-e8aea72c6ba4', v_m_m5_i_02, 'M5-I-02-02', 'Định nghĩa', 'TEXT', '- Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra

- Chi phí toàn phần (total cost of ownership): tổng chi phí thực tế của một giải pháp công nghệ, bao gồm giá mua, đào tạo, chuyển đổi dữ liệu, không chỉ giá niêm yết

- Rủi ro phụ thuộc nhà cung cấp: rủi ro khi một tổ chức phụ thuộc quá nhiều vào một nhà cung cấp, khó chuyển sang giải pháp khác nếu cần', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2591a1f7-7a08-4cb9-8d2c-b30b36b6614f', v_m_m5_i_02, 'M5-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc lựa chọn công cụ số và giải pháp công nghệ có thể có cho nhu cầu cụ thể cần phân tích sâu hơn — phân biệt nhu cầu bắt buộc và nhu cầu mong muốn, tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết.

Bảng so sánh giải pháp theo tiêu chí có trọng số giúp so sánh khách quan. Chi phí toàn phần không chỉ là giá mua mà còn gồm chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen. Rủi ro phụ thuộc nhà cung cấp cần được cân nhắc — nên ưu tiên giải pháp cho phép xuất dữ liệu dễ dàng. Thử nghiệm quy mô nhỏ trước khi triển khai rộng giúp giảm rủi ro.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7f7f7517-0c49-4792-a296-4c654ba87142', v_m_m5_i_02, 'M5-I-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chọn một nhu cầu công nghệ thật của bộ phận, so sánh tối thiểu 3 giải pháp theo bảng tiêu chí có trọng số, viết đề xuất 1 trang.

Bảng so sánh mẫu:

Sản phẩm nộp: Bảng so sánh giải pháp và đề xuất công nghệ 1 trang.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('dc64273a-7b18-44de-a53b-d164c5dc0e5d', v_m_m5_i_02, 'M5-I-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Chi phí toàn phần của một giải pháp công nghệ bao gồm những gì? A. Chỉ giá mua hoặc phí đăng ký B. Giá mua, chi phí đào tạo, chuyển đổi dữ liệu, thời gian làm quen C. Chỉ chi phí bảo trì D. Không thể tính được chi phí toàn phần Đáp án: B — Chi phí toàn phần phản ánh đầy đủ hơn giá niêm yết ban đầu.

2. Vì sao nên phân biệt nhu cầu bắt buộc và nhu cầu mong muốn khi chọn giải pháp công nghệ? A. Không cần phân biệt B. Tránh bị cuốn theo tính năng hấp dẫn nhưng không thực sự cần thiết C. Chỉ để làm phức tạp thêm quyết định D. Không có tác dụng thực tế Đáp án: B — Phân biệt rõ giúp tập trung vào giải pháp thực sự giải quyết vấn đề.

3. Rủi ro phụ thuộc nhà cung cấp là gì? A. Không có rủi ro gì đặc biệt B. Khó chuyển sang giải pháp khác nếu dữ liệu bị “khóa” trong hệ thống hiện tại C. Chỉ liên quan đến giá cả D. Không liên quan đến việc chọn công nghệ Đáp án: B — Đây là rủi ro cần cân nhắc, đặc biệt về khả năng xuất dữ liệu khi cần chuyển đổi.

4. Vì sao nên thử nghiệm quy mô nhỏ trước khi triển khai rộng? A. Không cần thiết, triển khai toàn bộ ngay là tốt nhất B. Giúp phát hiện vấn đề trước khi đầu tư toàn bộ, giảm rủi ro C. Chỉ làm chậm quá trình triển khai D. Không có lợi ích thực tế Đáp án: B — Thử nghiệm nhỏ giúp giảm thiểu rủi ro nếu giải pháp không phù hợp như kỳ vọng.

5. Bảng so sánh giải pháp theo tiêu chí có trọng số giúp ích gì? A. Không có tác dụng thực tế B. Cung cấp cơ sở so sánh khách quan hơn là chỉ dựa vào cảm tính C. Chỉ để trình bày đẹp mắt D. Làm chậm quá trình ra quyết định không cần thiết Đáp án: B — Đây là công cụ giúp ra quyết định có căn cứ, khách quan hơn.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0606b880-ab8f-42b9-969e-7bece42ee67a', v_m_m5_i_03, 'M5-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Phân biệt được các công cụ và công nghệ số có thể được sử dụng để tạo ra kiến thức và đổi mới quy trình và sản phẩm

- Gắn kết được cá nhân và tập thể vào quá trình xử lý nhận thức để hiểu và giải quyết các vấn đề khái niệm và tình huống có vấn đề trong môi trường số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ffc87aa3-0c93-49e5-b20b-60460af0e8d5', v_m_m5_i_03, 'M5-I-03-02', 'Định nghĩa', 'TEXT', '- Sơ đồ quy trình: biểu diễn trực quan các bước, người thực hiện, đầu vào và đầu ra của một quy trình công việc

- Điểm nghẽn (bottleneck): bước trong quy trình gây chậm trễ hoặc tắc nghẽn, ảnh hưởng đến tốc độ hoàn thành toàn bộ quy trình

- Điểm bàn giao: thời điểm công việc chuyển từ người này sang người khác trong quy trình', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('28b46c6f-387e-46de-b975-13ee4387cfd4', v_m_m5_i_03, 'M5-I-03-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc gắn kết cá nhân và tập thể vào quá trình xử lý nhận thức để giải quyết vấn đề mở rộng thành cải tiến quy trình bằng công nghệ số. Vẽ sơ đồ quy trình hiện tại giúp nhìn thấy toàn cảnh mà mô tả bằng lời dễ bỏ sót.

Nhận diện lãng phí theo các dạng phổ biến: chờ đợi, nhập liệu trùng lặp, phê duyệt thừa, thao tác thủ công lặp lại. Điểm bàn giao giữa người và giữa bộ phận thường là nơi dễ xảy ra chậm trễ nhất. Đo lường hiệu quả trước và sau cải tiến cần dựa trên số liệu cụ thể: thời gian hoàn thành, số lỗi phát sinh.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1769b126-abca-4ebb-be00-d8e9ee35fb49', v_m_m5_i_03, 'M5-I-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Chọn một quy trình đang có vấn đề trong bộ phận, vẽ sơ đồ hiện trạng, xác định điểm nghẽn, thiết kế phương án cải tiến và đo thử.

Sản phẩm nộp: Sơ đồ quy trình trước và sau, phân tích điểm nghẽn, số liệu đo lường.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('852a9e61-9bfa-49f5-b4a6-d0591d8c771b', v_m_m5_i_03, 'M5-I-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Điểm bàn giao giữa người hoặc bộ phận trong quy trình thường có đặc điểm gì? A. Luôn diễn ra suôn sẻ B. Dễ xảy ra chậm trễ hoặc mất thông tin nhất C. Không quan trọng bằng các bước khác D. Không cần phân tích riêng Đáp án: B — Điểm chuyển giao là nơi thường xảy ra vấn đề nhất trong một quy trình.

2. “Nhập liệu trùng lặp” là loại lãng phí nào trong quy trình? A. Chờ đợi B. Cùng một thông tin phải nhập lại nhiều lần ở các bước khác nhau C. Phê duyệt thừa D. Không phải là lãng phí Đáp án: B — Đây là dạng lãng phí phổ biến khi quy trình không được thiết kế liên kết dữ liệu hợp lý.

3. Vì sao nên thử nghiệm thay đổi quy trình ở quy mô nhỏ trước? A. Không cần thiết B. Phát hiện vấn đề chưa lường trước trước khi áp dụng toàn bộ C. Chỉ để làm chậm quá trình thay đổi D. Không có lợi ích thực tế Đáp án: B — Thử nghiệm nhỏ giúp giảm rủi ro khi triển khai thay đổi ở quy mô lớn.

4. Đo lường hiệu quả cải tiến nên dựa trên điều gì? A. Cảm nhận chủ quan là đủ B. Số liệu cụ thể: thời gian hoàn thành, số lỗi, số bước thực hiện C. Không cần đo lường D. Chỉ cần ý kiến của một người Đáp án: B — Số liệu định lượng chứng minh giá trị cải tiến thuyết phục hơn cảm nhận chủ quan.

5. Cách hiệu quả để thuyết phục đồng nghiệp chấp nhận thay đổi quy trình là gì? A. Áp đặt từ trên xuống không cần giải thích B. Giải thích lợi ích cụ thể cho họ và cho họ tham gia thiết kế C. Không cần thuyết phục, chỉ cần ra lệnh D. Thay đổi âm thầm không thông báo Đáp án: B — Sự tham gia và hiểu rõ lợi ích giúp tăng khả năng chấp nhận thay đổi.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('75c146e8-9b71-4941-bcd4-de0ee8a279e0', v_m_m5_i_04, 'M5-I-04-01', 'Mục tiêu học tập', 'TEXT', '- Thảo luận về lĩnh vực năng lực số của bản thân cần được cải thiện hoặc cập nhật

- Chỉ ra được cách hỗ trợ người khác phát triển năng lực số của họ

- Chỉ ra được nơi để tìm kiếm cơ hội phát triển bản thân và cập nhật sự phát triển số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('944e32ed-7408-42d1-acea-54e0fa6455be', v_m_m5_i_04, 'M5-I-04-02', 'Định nghĩa', 'TEXT', '- Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn

- Bản đồ năng lực nhóm: tổng hợp mức năng lực số hiện tại của tất cả thành viên trong nhóm theo từng lĩnh vực

- Học qua việc: phương thức phát triển năng lực thông qua thực hành trực tiếp trong công việc, thay vì đào tạo tách rời', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('e51e47cf-1819-425c-87b7-cb6f9e7dcf72', v_m_m5_i_04, 'M5-I-04-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc thảo luận về lĩnh vực năng lực số cần cải thiện và hỗ trợ người khác phát triển mở rộng sang phát triển năng lực cho cả nhóm. Đánh giá năng lực nhóm theo khung chuẩn cho phép nhìn thấy bức tranh chung: nhóm mạnh ở đâu, yếu ở đâu.

Các phương thức phát triển năng lực khác nhau phù hợp với tình huống khác nhau: đào tạo chính thức, kèm cặp một-một, học qua việc, chia sẻ nội bộ. Kỹ năng hướng dẫn người khác hiệu quả gồm ba bước: chia nhỏ, làm mẫu, để người học tự làm có quan sát.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('75a44a71-81d2-4a5b-b667-fba2e497067d', v_m_m5_i_04, 'M5-I-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Đánh giá năng lực số của nhóm mình theo 6 miền, lập bản đồ khoảng trống và kế hoạch phát triển 6 tháng; thiết kế và thực hiện một buổi chia sẻ nội bộ 30 phút về một kỹ năng cụ thể.

Sản phẩm nộp: Bản đồ năng lực nhóm, kế hoạch phát triển, tài liệu buổi chia sẻ.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ef9bfaa5-4c03-4aac-b6ef-5390951da1ad', v_m_m5_i_04, 'M5-I-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Phương thức phát triển năng lực nào phù hợp khi cần hướng dẫn sâu một kỹ năng cụ thể cho một người? A. Đào tạo chính thức cho nhóm lớn B. Kèm cặp một-một C. Không cần phương thức đặc biệt D. Chỉ cần gửi tài liệu đọc Đáp án: B — Kèm cặp một-một phù hợp cho việc hướng dẫn sâu, cá nhân hóa theo nhu cầu cụ thể.

2. Ba bước của kỹ năng hướng dẫn người khác hiệu quả là gì? A. Nói, viết, kiểm tra B. Chia nhỏ, làm mẫu, để người học tự làm có quan sát C. Ra lệnh, chờ đợi, đánh giá D. Không có quy trình cụ thể Đáp án: B — Đây là quy trình hướng dẫn hiệu quả giúp người học tiếp thu và thực hành đúng cách.

3. Vì sao cần cơ chế duy trì kỹ năng sau đào tạo? A. Không cần thiết B. Kỹ năng không được sử dụng thường xuyên dễ bị quên đi nhanh chóng C. Chỉ để có thêm hoạt động D. Không có tác dụng thực tế Đáp án: B — Thực hành lặp lại giúp củng cố và duy trì kỹ năng đã học được.

4. Bản đồ khoảng trống năng lực nhóm giúp ích gì? A. Không có tác dụng thực tế B. Xác định ai thiếu kỹ năng gì và mức độ ưu tiên xử lý C. Chỉ để đánh giá cá nhân D. Không liên quan đến kế hoạch phát triển Đáp án: B — Đây là cơ sở để lập kế hoạch phát triển năng lực có trọng tâm, ưu tiên đúng.

5. “Học qua việc” phù hợp nhất khi nào? A. Khi cần kiến thức nền tảng cho nhiều người B. Khi kỹ năng cần được thực hành trực tiếp trong bối cảnh công việc thật C. Không bao giờ phù hợp D. Chỉ phù hợp với nhân viên mới Đáp án: B — Học qua việc hiệu quả khi kỹ năng gắn liền với bối cảnh thực tế của công việc.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bbc04d4a-3209-4ef3-9ff2-f0139afd0a4a', v_m_m5_a_01, 'M5-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Thẩm định được các vấn đề kỹ thuật khi vận hành thiết bị và sử dụng môi trường số

- Giải quyết chúng bằng những giải pháp phù hợp nhất', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('147b4253-09ab-4899-97ce-501122f9908e', v_m_m5_a_01, 'M5-A-01-02', 'Định nghĩa', 'TEXT', '- Phân tích nguyên nhân gốc: phương pháp tìm ra nguyên nhân sâu xa thực sự gây ra vấn đề, thay vì chỉ xử lý triệu chứng bề mặt

- Kho tri thức nội bộ: hệ thống lưu trữ tập trung các giải pháp, hướng dẫn đã được tích lũy, giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('835d21d4-8769-4210-a591-4076919f8f93', v_m_m5_a_01, 'M5-A-01-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc thẩm định vấn đề kỹ thuật và giải quyết bằng giải pháp phù hợp nhất mở rộng thành xây dựng năng lực xử lý vấn đề của cả tổ chức. Mô hình hỗ trợ nội bộ theo cấp giúp phân bổ nguồn lực hợp lý, với ngưỡng chuyển cấp được xác định rõ.

Phân tích nguyên nhân gốc đi xa hơn việc chỉ xử lý triệu chứng — ví dụ một lỗi nhập liệu lặp lại có thể do giao diện thiết kế dễ gây nhầm lẫn, không phải do nhân viên bất cẩn. Kho tri thức nội bộ có cấu trúc rõ ràng giúp tổ chức không phải giải quyết lại từ đầu các vấn đề đã từng gặp.

Rủi ro phụ thuộc cá nhân xảy ra khi chỉ một người trong tổ chức nắm rõ cách vận hành một hệ thống quan trọng — khi người đó nghỉ phép hoặc rời đi, tổ chức gặp khó khăn nghiêm trọng; giảm rủi ro này đòi hỏi văn bản hóa quy trình và đào tạo dự phòng cho ít nhất một người khác. Khi làm việc với nhà cung cấp dịch vụ hỗ trợ bên ngoài, hợp đồng dịch vụ (SLA) nên quy định rõ thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố, làm cơ sở đánh giá chất lượng dịch vụ nhận được.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ba0000fc-7c42-4b8b-91fd-9808c29923d7', v_m_m5_a_01, 'M5-A-01-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Phân tích dữ liệu sự cố của doanh nghiệp trong một giai đoạn (có thể dùng dữ liệu mẫu dưới đây làm điểm khởi đầu, bổ sung dữ liệu thật nếu có), tìm 3 nguyên nhân gốc lặp lại, đề xuất mô hình hỗ trợ và kho tri thức.

Dữ liệu mẫu — Nhật ký sự cố 3 tháng (rút gọn):

(Gợi ý phân tích: sự cố đăng nhập tập trung sáng thứ Hai có thể liên quan đến việc hệ thống bảo trì cuối tuần hoặc quá tải đăng nhập đồng loạt; lỗi định dạng ngày lặp lại dù đã nhắc nhở gợi ý nguyên nhân gốc nằm ở thiết kế biểu mẫu chứ không phải ý thức nhân viên.)

Sản phẩm nộp: Phân tích nguyên nhân gốc, thiết kế mô hình hỗ trợ, cấu trúc kho tri thức.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('230a2b5b-2da8-40f5-b9de-c83306db2081', v_m_m5_a_01, 'M5-A-01-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Phân tích nguyên nhân gốc khác gì so với xử lý triệu chứng? A. Không có khác biệt B. Tìm nguyên nhân sâu xa thực sự, thay vì chỉ xử lý biểu hiện bề mặt C. Nguyên nhân gốc luôn khó tìm hơn D. Chỉ áp dụng cho vấn đề kỹ thuật Đáp án: B — Giải quyết nguyên nhân gốc mang lại hiệu quả bền vững hơn xử lý triệu chứng lặp lại.

2. Lỗi nhập sai định dạng ngày lặp lại dù đã nhắc nhở nhiều lần gợi ý điều gì? A. Nhân viên không đủ năng lực B. Nguyên nhân gốc có thể nằm ở thiết kế biểu mẫu, không phải ý thức cá nhân C. Cần sa thải nhân viên vi phạm D. Không có nguyên nhân cụ thể Đáp án: B — Lỗi lặp lại ở nhiều người khác nhau thường gợi ý vấn đề hệ thống hơn là vấn đề cá nhân.

3. Rủi ro phụ thuộc cá nhân trong vận hành là gì? A. Không có rủi ro gì B. Khi chỉ một người nắm rõ cách vận hành, tổ chức gặp khó khăn nếu người đó vắng mặt C. Chỉ liên quan đến lương thưởng D. Không thể giảm thiểu được Đáp án: B — Đây là rủi ro thực tế cần được giảm thiểu bằng văn bản hóa và đào tạo dự phòng.

4. Kho tri thức nội bộ mang lại lợi ích gì khi có nhân sự rời đi? A. Không có lợi ích gì B. Kiến thức không bị mất theo cá nhân, tổ chức không phải giải quyết lại từ đầu C. Chỉ giúp nhân sự mới làm quen nhanh hơn D. Không liên quan đến nhân sự rời đi Đáp án: B — Đây là lợi ích cốt lõi của việc xây dựng kho tri thức có hệ thống.

5. Hợp đồng dịch vụ (SLA) với nhà cung cấp hỗ trợ bên ngoài nên quy định gì? A. Không cần quy định gì cụ thể B. Thời gian phản hồi cam kết theo mức độ nghiêm trọng của sự cố C. Chỉ cần quy định giá dịch vụ D. Chỉ áp dụng cho hợp đồng lớn Đáp án: B — Đây là cơ sở để đánh giá chất lượng dịch vụ hỗ trợ nhận được từ nhà cung cấp.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6f858af8-1217-427d-8525-f5cadce1b197', v_m_m5_a_02, 'M5-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá được nhu cầu cá nhân

- Chọn được các công cụ số phù hợp nhất và các giải pháp công nghệ có thể có để giải quyết những nhu cầu đó

- Quyết định được những cách thích hợp nhất để điều chỉnh và tùy chỉnh môi trường số theo nhu cầu cá nhân', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a1935ae8-d006-474d-a11b-da2c4e1e1da9', v_m_m5_a_02, 'M5-A-02-02', 'Định nghĩa', 'TEXT', '- Giải pháp công nghệ (Điều 2, TT 02/2025/TT-BGDĐT): tập hợp các công cụ kỹ thuật có liên quan (phần mềm, phần cứng) hoặc dịch vụ hoặc kết hợp để giải quyết vấn đề đặt ra

- Lộ trình công nghệ: kế hoạch có thứ tự ưu tiên về các khoản đầu tư và thay đổi công nghệ trong một khoảng thời gian, gắn với mục tiêu kinh doanh

- Mức độ sẵn sàng của tổ chức: khả năng của tổ chức (về hạ tầng, năng lực nhân sự, văn hóa) trong việc tiếp nhận một thay đổi công nghệ mới', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('91a75f87-12b1-458b-b182-909f74fd5f18', v_m_m5_a_02, 'M5-A-02-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc quyết định cách thích hợp nhất để điều chỉnh môi trường số theo nhu cầu mở rộng thành chiến lược công nghệ cấp tổ chức. Lộ trình công nghệ hiệu quả bắt đầu từ mục tiêu kinh doanh, không phải từ công nghệ đang thịnh hành.

Mức độ sẵn sàng của tổ chức không chỉ là vấn đề kỹ thuật mà còn là vấn đề con người — nhân viên có sẵn sàng thay đổi thói quen làm việc không. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0b88ba2d-5d24-41ac-ab56-117bd45509bd', v_m_m5_a_02, 'M5-A-02-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây lộ trình công nghệ 12 tháng cho doanh nghiệp: đánh giá hiện trạng, xác định ưu tiên, kế hoạch triển khai cho hạng mục ưu tiên nhất.

Sản phẩm nộp: Lộ trình công nghệ, kế hoạch triển khai, khung đánh giá hiệu quả.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5feeceae-cd39-4d03-b69e-7347aaa04a88', v_m_m5_a_02, 'M5-A-02-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Lộ trình công nghệ nên bắt đầu từ đâu? A. Từ công nghệ đang thịnh hành B. Từ mục tiêu kinh doanh cụ thể C. Từ ngân sách có sẵn D. Từ sở thích cá nhân của lãnh đạo Đáp án: B — Mục tiêu kinh doanh phải là căn cứ chính để lựa chọn đầu tư công nghệ, không phải xu hướng.

2. Nguyên nhân thất bại phổ biến của dự án công nghệ ở doanh nghiệp nhỏ thường là gì? A. Luôn do công nghệ kém chất lượng B. Thiếu sự tham gia của người dùng cuối, đánh giá thấp chi phí đào tạo C. Không có nguyên nhân phổ biến nào D. Chỉ do thiếu ngân sách Đáp án: B — Đây là các nguyên nhân thường gặp hơn là vấn đề kỹ thuật thuần túy.

3. Mức độ sẵn sàng của tổ chức bao gồm yếu tố nào ngoài kỹ thuật? A. Chỉ có yếu tố kỹ thuật là quan trọng B. Sự sẵn sàng thay đổi thói quen làm việc và rào cản văn hóa C. Không có yếu tố nào khác D. Chỉ liên quan đến ngân sách Đáp án: B — Yếu tố con người và văn hóa tổ chức quan trọng không kém yếu tố kỹ thuật.

4. Ma trận tác động và khả thi dùng để làm gì? A. Không có tác dụng thực tế B. Ưu tiên đầu tư vào hạng mục vừa có tác động lớn vừa khả thi thực hiện C. Chỉ để trình bày báo cáo D. Chỉ áp dụng cho dự án nhỏ Đáp án: B — Đây là công cụ giúp phân bổ nguồn lực đầu tư một cách hợp lý.

5. Đánh giá hiệu quả sau triển khai nên dựa trên điều gì? A. Cảm nhận chủ quan sau khi triển khai B. Các chỉ số đã đặt ra từ đầu, so sánh với mục tiêu ban đầu C. Chỉ tiêu tự đặt ra sau khi biết kết quả D. Không cần đánh giá hiệu quả Đáp án: B — Đánh giá dựa trên chỉ số đặt trước đảm bảo tính khách quan, tránh điều chỉnh tiêu chí sau khi biết kết quả.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a0bec875-95e5-4dc3-b985-8397d085ad3f', v_m_m5_a_03, 'M5-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Điều chỉnh được các công cụ và công nghệ số phù hợp nhất để tạo ra kiến thức cũng như đổi mới quy trình và sản phẩm

- Giải quyết được các vấn đề khái niệm và tình huống có vấn đề của cá nhân và tập thể trong môi trường số', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2c98a50f-91d5-4c34-a614-8268cfe22c7a', v_m_m5_a_03, 'M5-A-03-02', 'Định nghĩa', 'TEXT', '- Giả thuyết kiểm chứng được: một dự đoán cụ thể có thể được xác nhận đúng hoặc sai thông qua thử nghiệm thực tế

- Thử nghiệm quy mô nhỏ (pilot): việc áp dụng một ý tưởng mới ở phạm vi hạn chế để kiểm tra tính khả thi trước khi mở rộng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('17b8a0a6-37c9-49bd-a6e6-b9621723a087', v_m_m5_a_03, 'M5-A-03-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc điều chỉnh công cụ và công nghệ số phù hợp nhất để tạo kiến thức mở rộng thành đổi mới sáng tạo cấp tổ chức. Cơ hội đổi mới thường xuất hiện từ ba nguồn: điểm đau của khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng.

Từ ý tưởng ban đầu, cần chuyển hóa thành giả thuyết kiểm chứng được với tiêu chí thành công xác định trước khi chạy thử nghiệm. Thiết kế thử nghiệm nhỏ, chi phí thấp giúp kiểm chứng giả thuyết mà không cần đầu tư lớn ngay từ đầu. Xây dựng văn hóa cho phép thử và sai có kiểm soát đòi hỏi lãnh đạo không trừng phạt thử nghiệm thất bại có phương pháp.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5370689b-2cf8-4c8e-9291-822b61c7fe90', v_m_m5_a_03, 'M5-A-03-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Nhận diện một cơ hội đổi mới trong doanh nghiệp, thiết kế thử nghiệm với giả thuyết và tiêu chí thành công rõ ràng, trình bày phương án.

Sản phẩm nộp: Đề xuất đổi mới, thiết kế thử nghiệm, tiêu chí đánh giá.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('937f9151-7970-45fb-9315-ff7fe4cc1860', v_m_m5_a_03, 'M5-A-03-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Ba nguồn phổ biến của cơ hội đổi mới là gì? A. Chỉ có công nghệ mới B. Điểm đau khách hàng, điểm kém hiệu quả nội bộ, công nghệ mới khả dụng C. Chỉ từ ý tưởng của lãnh đạo D. Không có nguồn cụ thể Đáp án: B — Đây là ba nguồn cơ hội đổi mới phổ biến trong thực tế doanh nghiệp.

2. Vì sao cần chuyển ý tưởng thành giả thuyết kiểm chứng được? A. Không cần thiết B. Để có thể đo lường kết quả thử nghiệm một cách cụ thể C. Chỉ để làm phức tạp thêm ý tưởng D. Không có tác dụng thực tế Đáp án: B — Giả thuyết cụ thể mới cho phép đánh giá thử nghiệm thành công hay không một cách khách quan.

3. Tiêu chí thành công của thử nghiệm nên được xác định khi nào? A. Sau khi có kết quả B. Trước khi chạy thử nghiệm C. Không cần xác định D. Tùy ý điều chỉnh trong quá trình Đáp án: B — Xác định trước tránh việc diễn giải kết quả theo hướng có lợi sau khi đã biết số liệu.

4. Vì sao không nên trừng phạt thử nghiệm thất bại có phương pháp? A. Nên trừng phạt để răn đe B. Sợ thất bại khiến nhân viên ngại đề xuất ý tưởng mới C. Không liên quan đến văn hóa tổ chức D. Thất bại luôn nên được khen thưởng Đáp án: B — Văn hóa trừng phạt thất bại làm giảm động lực đổi mới trong tổ chức.

5. Cách phân biệt cơ hội công nghệ thật với sự cường điệu là gì? A. Chạy theo vì nhiều người đang nói về nó B. Đặt câu hỏi cụ thể công nghệ đó giải quyết vấn đề gì của tổ chức C. Không thể phân biệt được D. Luôn tin vào xu hướng truyền thông Đáp án: B — Đánh giá dựa trên vấn đề cụ thể cần giải quyết giúp tránh chạy theo xu hướng không thực chất.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('06868387-768f-4811-b58d-ced50746dd8c', v_m_m5_a_04, 'M5-A-04-01', 'Mục tiêu học tập', 'TEXT', '- Quyết định được những cách thích hợp nhất để cải thiện hoặc cập nhật nhu cầu về năng lực số của chính mình

- Đánh giá được sự phát triển năng lực số của người khác

- Lựa chọn được những cơ hội thích hợp nhất để phát triển bản thân và cập nhật những phát triển mới', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c370bb6c-ff1f-4418-845a-acf69ad598a1', v_m_m5_a_04, 'M5-A-04-02', 'Định nghĩa', 'TEXT', '- Năng lực số (Điều 2, TT 02/2025/TT-BGDĐT): khả năng sử dụng công nghệ số để hoàn thành nhiệm vụ cụ thể hoặc để giải quyết vấn đề trong thực tiễn

- Đội ngũ nòng cốt: nhóm nhân sự được đào tạo chuyên sâu trước, đóng vai trò lan tỏa kiến thức và hỗ trợ đồng nghiệp trong tổ chức

- Lộ trình nghề nghiệp gắn với năng lực số: việc đưa yêu cầu và kết quả phát triển năng lực số vào quá trình đánh giá và thăng tiến của nhân viên', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5126c206-fffb-4597-bee6-f85ca8b56b0b', v_m_m5_a_04, 'M5-A-04-03', 'Nội dung', 'TEXT', 'Ở mức nâng cao, việc quyết định cách thích hợp nhất để cải thiện năng lực số và đánh giá sự phát triển của người khác mở rộng thành phát triển năng lực số toàn tổ chức. Khảo sát và lập bản đồ năng lực số toàn tổ chức cho phép nhìn thấy bức tranh tổng thể.

Chiến lược phát triển năng lực số cấp tổ chức cần cân nhắc ba hướng: tuyển mới, đào tạo lại nhân sự hiện có, thuê ngoài. Xây dựng đội ngũ nòng cốt — đào tạo trước một nhóm nhỏ để lan tỏa kiến thức — là cách mở rộng đào tạo hiệu quả về chi phí. Đo lường hiệu quả đào tạo không nên chỉ dừng ở điểm số mà cần theo dõi thay đổi hành vi thực tế.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d8e623fd-27f0-4a92-85fb-cfb27d90e7e6', v_m_m5_a_04, 'M5-A-04-04', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây chiến lược phát triển năng lực số cho doanh nghiệp: bản đồ hiện trạng theo vị trí, ma trận yêu cầu, phân tích khoảng trống, chương trình đào tạo ưu tiên và bộ chỉ số đo lường.

Sản phẩm nộp: Bản đồ năng lực tổ chức, ma trận yêu cầu theo vị trí, chiến lược phát triển, bộ chỉ số.', 4, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('61eb94cc-b892-4696-940b-d1987ef78d05', v_m_m5_a_04, 'M5-A-04-05', 'Câu hỏi ôn tập', 'QUIZ', '1. Ba hướng chiến lược phát triển năng lực số cấp tổ chức là gì? A. Chỉ có đào tạo là lựa chọn duy nhất B. Tuyển mới, đào tạo lại, thuê ngoài C. Chỉ có thuê ngoài D. Không có chiến lược cụ thể Đáp án: B — Đây là ba hướng tiếp cận phù hợp với các tình huống khác nhau về nhu cầu năng lực.

2. Đội ngũ nòng cốt có vai trò gì trong phát triển năng lực số? A. Không có vai trò cụ thể B. Được đào tạo trước, sau đó lan tỏa kiến thức cho đồng nghiệp C. Chỉ để quản lý hành chính D. Chỉ dành cho cấp lãnh đạo Đáp án: B — Đây là cách tiếp cận hiệu quả về chi phí để mở rộng phạm vi đào tạo trong tổ chức.

3. Đo lường hiệu quả đào tạo nên dựa vào điều gì thay vì chỉ điểm số bài kiểm tra? A. Chỉ cần điểm số là đủ B. Thay đổi hành vi thực tế trong công việc sau đào tạo C. Không cần đo lường gì thêm D. Chỉ cần số lượng người tham gia Đáp án: B — Thay đổi hành vi thực tế phản ánh đào tạo có thực sự tạo ra giá trị hay không.

4. Vì sao nên gắn năng lực số vào lộ trình thăng tiến của nhân viên? A. Không có lý do cụ thể B. Tạo động lực thực chất cho việc học tập, thay vì đào tạo mang tính hình thức C. Chỉ để tăng thêm thủ tục hành chính D. Không liên quan đến hiệu quả đào tạo Đáp án: B — Gắn kết với sự nghiệp cá nhân tạo động lực học tập mạnh mẽ hơn đào tạo không có hệ quả thực tế.

5. Khi nào nên chọn hướng “thuê ngoài” thay vì đào tạo nội bộ? A. Luôn nên thuê ngoài B. Khi nhu cầu không thường xuyên, không đáng đầu tư xây năng lực nội bộ C. Không bao giờ nên thuê ngoài D. Chỉ khi không có ngân sách Đáp án: B — Thuê ngoài phù hợp khi đầu tư xây dựng năng lực nội bộ không hiệu quả về chi phí so với nhu cầu thực tế.', 5, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('51153988-032b-4788-b6ad-e881841a0030', v_m_m6_f_01, 'M6-F-01-01', 'Mục tiêu học tập', 'TEXT', '- Xác định được khái niệm cơ bản của AI

- Nhớ lại được các ứng dụng đơn giản của AI trong cuộc sống hằng ngày

- Giải thích được nguyên tắc hoạt động cơ bản của AI

- Diễn giải được các thuật ngữ liên quan đến AI', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('257b7032-e93a-467a-948c-9c71c07f5b2f', v_m_m6_f_01, 'M6-F-01-02', 'Định nghĩa', 'TEXT', '- Trí tuệ nhân tạo (AI): theo Thông tư 02/2025/TT-BGDĐT, là việc phát triển các hệ thống máy móc có khả năng thực hiện các nhiệm vụ đòi hỏi trí tuệ con người như học tập, suy luận và giải quyết vấn đề

- Trí tuệ nhân tạo tạo sinh (Gen AI): một lĩnh vực thuộc AI tập trung vào việc tạo ra dữ liệu mới — văn bản, hình ảnh, âm thanh, video, mã nguồn — dựa trên dữ liệu đầu vào đã được huấn luyện trước đó

- Mô hình AI: hệ thống đã được huấn luyện trên một khối lượng lớn dữ liệu để nhận diện quy luật và đưa ra dự đoán hoặc tạo nội dung mới', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b2f833a0-e1e8-4223-9a13-493efdd36aee', v_m_m6_f_01, 'M6-F-01-03', 'Nội dung', 'TEXT', 'AI, nói một cách đơn giản, là các chương trình máy tính được “huấn luyện” từ một khối lượng dữ liệu khổng lồ để nhận diện quy luật, sau đó áp dụng quy luật đó vào tình huống mới. Khác với phần mềm truyền thống được lập trình sẵn từng bước cụ thể, AI học từ ví dụ — giống như một người học nói tiếng Việt bằng cách nghe hàng ngàn câu nói, không phải học thuộc lòng từng quy tắc ngữ pháp.

Gen AI (trí tuệ nhân tạo tạo sinh) là nhóm công cụ AI phổ biến nhất hiện nay mà người đi làm hay gặp: các công cụ trò chuyện dạng văn bản (trả lời câu hỏi, viết nháp email), công cụ tạo hình ảnh từ mô tả bằng chữ, hoặc công cụ chuyển giọng nói thành văn bản.

Trong đời sống và công việc hằng ngày, AI đã hiện diện ở nhiều nơi tưởng chừng không liên quan đến “công nghệ cao”: gợi ý sản phẩm khi mua sắm trực tuyến, bộ lọc thư rác trong email, tính năng tự động hoàn thành khi gõ tin nhắn, ứng dụng dịch thuật, hay hệ thống nhận diện khuôn mặt để mở khóa điện thoại.

Nguyên tắc hoạt động cơ bản của AI có thể hình dung qua ba bước: (1) AI được “cho xem” một lượng lớn dữ liệu mẫu trong quá trình huấn luyện, (2) từ đó AI tự nhận diện các quy luật thống kê trong dữ liệu, (3) khi gặp dữ liệu mới, AI áp dụng quy luật đã học để đưa ra dự đoán hoặc tạo ra nội dung. Điều quan trọng cần hiểu: AI không “hiểu” theo nghĩa con người hiểu — nó dự đoán dựa trên xác suất và mẫu hình đã học, điều này giải thích vì sao đôi khi AI đưa ra câu trả lời nghe rất tự tin nhưng lại sai.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('11034a33-e380-46c4-96c9-cf4191245bf7', v_m_m6_f_01, 'M6-F-01-04', 'Ví dụ minh họa', 'TEXT', 'Chị Mai làm ở bộ phận hành chính, mỗi ngày dùng tính năng gợi ý từ khi gõ tin nhắn trên điện thoại — đây là một dạng AI đơn giản. Cùng lúc đó, công ty chị dùng một hệ thống lọc email tự động phân loại email rác — cũng là AI, nhưng “huấn luyện” trên hàng triệu email đã được đánh dấu là rác/không rác trước đó. Cả hai ví dụ đều là AI, dù một cái chị dùng mỗi ngày mà không để ý, một cái công ty đầu tư triển khai riêng.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('929fd20c-48eb-433f-85b8-b14ab48c9318', v_m_m6_f_01, 'M6-F-01-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Liệt kê 5 công cụ hoặc ứng dụng có dùng AI mà bản thân từng gặp trong công việc hoặc đời sống hằng ngày (có thể là những thứ rất quen thuộc, không cần “cao siêu”), với mỗi công cụ, giải thích ngắn gọn AI đóng vai trò gì ở đó.

Sản phẩm nộp: Bảng 5 ứng dụng AI đã gặp kèm giải thích.', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('1f8891b0-b2f8-4433-9e75-28fb1e45da11', v_m_m6_f_01, 'M6-F-01-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Theo Thông tư 02/2025/TT-BGDĐT, AI được định nghĩa là gì? A. Một loại phần mềm diệt virus B. Hệ thống máy móc có khả năng thực hiện nhiệm vụ đòi hỏi trí tuệ con người C. Một loại mạng xã hội D. Thiết bị lưu trữ dữ liệu Đáp án: B — Đây là định nghĩa chính thức theo Thông tư.

2. Gen AI (trí tuệ nhân tạo tạo sinh) tập trung vào việc gì? A. Lưu trữ dữ liệu B. Tạo ra dữ liệu mới như văn bản, hình ảnh, âm thanh dựa trên dữ liệu đã huấn luyện C. Sửa lỗi phần cứng D. Quản lý mạng máy tính Đáp án: B — Đây là đặc trưng phân biệt Gen AI với các dạng AI khác.

3. Vì sao AI đôi khi đưa ra câu trả lời sai dù nghe rất tự tin? A. AI luôn cố ý nói sai B. AI dự đoán dựa trên xác suất và mẫu hình đã học, không thực sự “hiểu” như con người C. AI không có khả năng trả lời D. Do lỗi kết nối mạng Đáp án: B — Đây là bản chất của cách AI hoạt động, khác với suy luận logic của con người.

4. Đâu là ví dụ về AI trong đời sống hằng ngày? A. Chỉ có robot công nghiệp mới là AI B. Gợi ý tự động hoàn thành khi gõ tin nhắn cũng là một dạng AI C. AI chỉ tồn tại trong phim khoa học viễn tưởng D. AI chỉ dùng trong nghiên cứu khoa học Đáp án: B — AI đã hiện diện trong nhiều công cụ quen thuộc hằng ngày.

5. AI học từ dữ liệu theo cách nào? A. Được lập trình sẵn từng bước cụ thể như phần mềm truyền thống B. Nhận diện quy luật từ khối lượng lớn dữ liệu mẫu trong quá trình huấn luyện C. Không cần dữ liệu để hoạt động D. Chỉ hoạt động khi có kết nối Internet Đáp án: B — Đây là điểm khác biệt cốt lõi giữa AI và phần mềm truyền thống.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b230d340-8bdf-4d07-b5b5-4612f400d733', v_m_m6_f_02, 'M6-F-02-01', 'Mục tiêu học tập', 'TEXT', '- Nhận diện được các công cụ AI đơn giản

- Thực hiện được các thao tác cơ bản với công cụ AI

- Nhận thức được cơ bản về các vấn đề đạo đức và pháp lý liên quan đến AI

- Áp dụng được công cụ AI để giải quyết vấn đề đơn giản', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b12b6300-9888-45f7-b238-d04dee330fde', v_m_m6_f_02, 'M6-F-02-02', 'Định nghĩa', 'TEXT', '- Yêu cầu (prompt): câu lệnh hoặc câu hỏi mà người dùng nhập vào công cụ AI để nhận được kết quả mong muốn

- Công cụ AI công cộng: dịch vụ AI trực tuyến miễn phí hoặc trả phí, không thuộc quyền kiểm soát của doanh nghiệp, dữ liệu nhập vào có thể được lưu trữ hoặc dùng để huấn luyện thêm', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('a8f1c128-17d7-489e-9464-06dfe7c1204a', v_m_m6_f_02, 'M6-F-02-03', 'Nội dung', 'TEXT', 'Làm quen với một công cụ AI tạo sinh dạng trò chuyện (chatbot văn bản) là bước khởi đầu phổ biến nhất. Các công cụ này nhận yêu cầu bằng ngôn ngữ tự nhiên (viết như nói chuyện bình thường) và trả về văn bản, có thể là câu trả lời, bản tóm tắt, hoặc bản nháp.

Cách đặt yêu cầu (prompt) cơ bản ảnh hưởng lớn đến chất lượng kết quả. Một yêu cầu mơ hồ (“viết cho tôi cái gì đó về báo cáo”) thường cho kết quả chung chung không dùng được; một yêu cầu cụ thể (nêu rõ chủ đề, độ dài mong muốn, đối tượng đọc) thường cho kết quả sát nhu cầu hơn nhiều.

Nguyên tắc an toàn quan trọng nhất ở mức cơ bản: không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ AI công cộng chưa được doanh nghiệp phê duyệt. Dữ liệu nhập vào các công cụ AI miễn phí trên mạng có thể được lưu trữ trên máy chủ bên ngoài, thậm chí được dùng để huấn luyện lại mô hình — nghĩa là thông tin đó có thể “rò rỉ” ra ngoài phạm vi kiểm soát của doanh nghiệp theo cách không thể thu hồi lại.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('91a246f0-3aea-46fe-9601-b557d80c44db', v_m_m6_f_02, 'M6-F-02-04', 'Ví dụ minh họa', 'TEXT', 'Anh Tuấn cần tóm tắt một bản báo cáo dài 10 trang cho cuộc họp chiều nay. Thay vì đọc và tóm tắt thủ công mất một giờ, anh dùng công cụ AI: dán nội dung báo cáo (đã loại bỏ tên khách hàng và số liệu tài chính nhạy cảm) và yêu cầu “tóm tắt thành 5 gạch đầu dòng, tập trung vào các con số quan trọng”. Anh nhận được bản tóm tắt trong 10 giây, đọc lại để kiểm tra có đúng ý báo cáo gốc không, rồi mới dùng cho cuộc họp. Anh đã làm đúng hai việc: đặt yêu cầu cụ thể, và ẩn thông tin nhạy cảm trước khi dán vào công cụ công cộng.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('d50938a1-0fae-41f5-a573-65d101eb5b04', v_m_m6_f_02, 'M6-F-02-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Dùng một công cụ AI để hỗ trợ một việc công việc đơn giản (ví dụ: tóm tắt một văn bản, soạn nháp một email, dịch một đoạn văn bản ngắn). Ghi lại yêu cầu (prompt) đã đặt và đánh giá kết quả nhận được có đạt yêu cầu không, cần chỉnh sửa gì.

Sản phẩm nộp: Bản ghi thao tác (yêu cầu đã đặt) + kết quả nhận được + nhận xét.', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('146fdc20-ccf3-4714-adef-93132519ac43', v_m_m6_f_02, 'M6-F-02-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao cách đặt yêu cầu (prompt) ảnh hưởng đến chất lượng kết quả AI? A. Không có ảnh hưởng gì B. Yêu cầu càng cụ thể, kết quả càng sát nhu cầu thực tế C. AI luôn cho kết quả giống nhau bất kể yêu cầu gì D. Chỉ ảnh hưởng đến tốc độ trả lời Đáp án: B — Yêu cầu mơ hồ thường cho kết quả chung chung, không dùng được.

2. Nguyên tắc an toàn quan trọng nhất khi dùng công cụ AI công cộng là gì? A. Luôn dùng công cụ miễn phí B. Không đưa thông tin nhạy cảm hoặc dữ liệu khách hàng vào công cụ chưa được phê duyệt C. Chỉ dùng vào buổi sáng D. Luôn dùng tiếng Anh khi đặt yêu cầu Đáp án: B — Dữ liệu nhập vào công cụ công cộng có thể bị lưu trữ hoặc dùng để huấn luyện ngoài kiểm soát.

3. Vì sao dữ liệu nhập vào công cụ AI công cộng có thể là rủi ro? A. Không có rủi ro gì B. Có thể được lưu trữ hoặc dùng để huấn luyện lại mô hình ngoài kiểm soát của doanh nghiệp C. Chỉ tốn thêm thời gian D. Chỉ ảnh hưởng đến tốc độ xử lý Đáp án: B — Đây là rủi ro thực tế cần lưu ý khi dùng công cụ AI chưa được phê duyệt.

4. Yêu cầu (prompt) nào sau đây hiệu quả hơn? A. “Viết cho tôi cái gì đó” B. “Tóm tắt báo cáo này thành 5 gạch đầu dòng, tập trung vào số liệu quan trọng” C. “Giúp tôi với” D. “Làm việc gì đó hay ho” Đáp án: B — Yêu cầu cụ thể về định dạng, độ dài và trọng tâm cho kết quả sát nhu cầu hơn.

5. Trước khi dán một văn bản công việc vào công cụ AI công cộng, nên làm gì? A. Không cần làm gì cả B. Loại bỏ thông tin nhạy cảm như tên khách hàng, số liệu tài chính C. Dịch sang tiếng Anh trước D. Chụp ảnh màn hình lại Đáp án: B — Đây là bước bảo vệ dữ liệu cần thiết trước khi dùng công cụ công cộng.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('4e4a6772-82cb-4767-8953-f8783b6e0360', v_m_m6_f_03, 'M6-F-03-01', 'Mục tiêu học tập', 'TEXT', '- Nhận diện được các yếu tố cơ bản của hệ thống AI cần được đánh giá

- Mô tả được các chức năng chính của hệ thống AI

- Giải thích được cách hoạt động của các hệ thống AI đơn giản

- Tóm tắt được đặc điểm và ứng dụng của hệ thống AI', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f06484bf-cee5-4a14-84f5-e459923c0b87', v_m_m6_f_03, 'M6-F-03-02', 'Định nghĩa', 'TEXT', '- Ảo giác AI (AI hallucination): hiện tượng công cụ AI tạo ra thông tin nghe có vẻ hợp lý, tự tin, nhưng thực chất sai hoặc không có căn cứ thật

- Kiểm tra chéo: việc đối chiếu kết quả AI đưa ra với một nguồn khác đáng tin cậy trước khi sử dụng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('056fe67c-5a70-4d09-8afe-385f2600bbca', v_m_m6_f_03, 'M6-F-03-03', 'Nội dung', 'TEXT', 'Một trong những hiểu lầm phổ biến nhất về AI tạo sinh là tin rằng nó luôn đúng vì trả lời rất tự tin và trôi chảy. Thực tế, các công cụ AI tạo sinh có thể tạo ra thông tin sai lệch — gọi là hiện tượng “ảo giác AI” — mà không hề có dấu hiệu báo trước nào trong cách trình bày. AI có thể bịa ra một con số thống kê, một trích dẫn không tồn tại, hoặc một sự kiện chưa từng xảy ra, tất cả đều được viết với giọng văn chắc chắn như thể đó là sự thật đã kiểm chứng.

Nguyên nhân của hiện tượng này bắt nguồn từ chính cách AI hoạt động: nó dự đoán từ tiếp theo có khả năng xuất hiện cao nhất dựa trên mẫu hình đã học, không phải tra cứu một cơ sở dữ liệu sự thật đã được xác minh. Vì vậy, với các câu hỏi mà AI “không chắc chắn”, nó vẫn có xu hướng tạo ra một câu trả lời nghe hợp lý thay vì nói “tôi không biết”.

Kiểm tra chéo là biện pháp phòng vệ cơ bản nhất: với bất kỳ thông tin quan trọng nào AI đưa ra — đặc biệt số liệu, tên riêng, sự kiện cụ thể — nên tìm một nguồn độc lập khác để xác nhận trước khi sử dụng, đặc biệt khi thông tin đó sẽ được dùng trong công việc hoặc chia sẻ cho người khác.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('0c761ef7-8290-420b-a630-834f321e3978', v_m_m6_f_03, 'M6-F-03-04', 'Ví dụ minh họa', 'TEXT', 'Chị Hương hỏi một công cụ AI về quy định nghỉ phép năm theo luật lao động hiện hành. Công cụ trả lời rất chi tiết và tự tin, trích dẫn cả số điều luật cụ thể. Vì đây là thông tin quan trọng sẽ dùng để tư vấn cho đồng nghiệp, chị tra cứu lại trên cổng thông tin chính thức của cơ quan quản lý lao động — và phát hiện số điều luật AI trích dẫn không khớp với văn bản thật, dù nội dung tổng quát là gần đúng. Nếu chị dùng thẳng câu trả lời của AI mà không kiểm tra chéo, thông tin sai lệch đó có thể đã được truyền đi.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('50c58ed6-e863-4b41-8f33-9374e56bb273', v_m_m6_f_03, 'M6-F-03-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Yêu cầu một công cụ AI trả lời một câu hỏi mà bản thân đã biết đáp án chính xác từ trước (ví dụ một sự kiện lịch sử công ty, một quy định nội bộ, hoặc một kiến thức chuyên môn quen thuộc). So sánh câu trả lời của AI với đáp án đã biết và nhận xét về độ chính xác.

Sản phẩm nộp: Bản so sánh kết quả AI với đáp án đã biết, ghi rõ điểm đúng/sai nếu có.', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fec207e8-95f1-4fea-a94b-9d10ef09e9c4', v_m_m6_f_03, 'M6-F-03-06', 'Câu hỏi ôn tập', 'QUIZ', '1. “Ảo giác AI” (AI hallucination) là hiện tượng gì? A. AI bị lỗi kỹ thuật không hoạt động được B. AI tạo ra thông tin nghe hợp lý, tự tin nhưng thực chất sai hoặc không có căn cứ C. AI hiển thị hình ảnh sai định dạng D. AI phản hồi chậm hơn bình thường Đáp án: B — Đây là hiện tượng thông tin sai được trình bày một cách tự tin, không có dấu hiệu cảnh báo.

2. Vì sao AI có thể tạo ra thông tin sai mà không có dấu hiệu báo trước? A. AI luôn cố tình lừa dối B. AI dự đoán từ tiếp theo có khả năng cao nhất, không tra cứu cơ sở dữ liệu đã xác minh C. AI không có khả năng ngôn ngữ D. AI chỉ hoạt động khi có lỗi Đáp án: B — Đây là bản chất cách AI tạo sinh hoạt động, dựa trên dự đoán mẫu hình chứ không phải tra cứu sự thật.

3. Kiểm tra chéo kết quả AI có ý nghĩa gì? A. Không cần thiết nếu AI trả lời tự tin B. Đối chiếu kết quả AI với nguồn độc lập khác trước khi sử dụng C. Chỉ cần hỏi lại AI một lần nữa D. Chỉ áp dụng cho câu hỏi đơn giản Đáp án: B — Đây là biện pháp phòng vệ cơ bản với thông tin quan trọng từ AI.

4. Khi nào đặc biệt cần kiểm tra chéo kết quả AI? A. Không bao giờ cần thiết B. Với thông tin quan trọng như số liệu, tên riêng, sự kiện cụ thể sẽ dùng trong công việc C. Chỉ khi AI trả lời chậm D. Chỉ khi dùng công cụ AI miễn phí Đáp án: B — Thông tin quan trọng có tác động lớn nếu sai nên cần được xác minh trước khi sử dụng.

5. Vì sao không nên tin tưởng tuyệt đối vào giọng văn tự tin của AI? A. AI luôn nói giọng không chắc chắn B. Giọng văn tự tin không đồng nghĩa với thông tin chính xác C. AI không có khả năng viết tự tin D. Không có lý do cụ thể Đáp án: B — Đây là hiểu lầm phổ biến cần tránh; độ tự tin trong văn phong không phản ánh độ chính xác thực tế.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('37db810b-2ddc-4f59-aad5-b89509c24a59', v_m_m6_i_01, 'M6-I-01-01', 'Mục tiêu học tập', 'TEXT', '- Áp dụng được nguyên tắc cơ bản của AI để giải quyết vấn đề đơn giản

- Thực hiện được thao tác cơ bản trên các công cụ AI

- Phân tích được cách AI hoạt động trong các ứng dụng cụ thể

- So sánh được các hệ thống AI khác nhau và cách chúng xử lý dữ liệu', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('08c53769-43ce-48a6-a098-c9f889e114d6', v_m_m6_i_01, 'M6-I-01-02', 'Định nghĩa', 'TEXT', '- Công cụ AI chuyên biệt: công cụ AI được thiết kế tối ưu cho một loại tác vụ cụ thể (viết, thiết kế hình ảnh, phân tích dữ liệu, dịch thuật), khác với công cụ AI đa năng

- Đầu vào đa phương tiện (multimodal input): khả năng một số công cụ AI nhận nhiều loại dữ liệu đầu vào — văn bản, hình ảnh, âm thanh — cùng lúc', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('c0212166-b1e6-4f0c-bf63-325e709e6e52', v_m_m6_i_01, 'M6-I-01-03', 'Nội dung', 'TEXT', 'Công cụ AI hiện nay không còn là một loại duy nhất — có công cụ chuyên viết văn bản, công cụ chuyên tạo hình ảnh từ mô tả, công cụ chuyên phân tích số liệu trong bảng tính, công cụ chuyên tạo bản trình chiếu, công cụ chuyên dịch thuật. Việc chọn đúng công cụ cho đúng loại việc quan trọng hơn việc chọn công cụ “nổi tiếng nhất” — một công cụ giỏi viết văn bản không nhất thiết giỏi phân tích số liệu.

So sánh các công cụ AI khác nhau cho cùng một loại việc là kỹ năng thực tế cần có: một số công cụ xử lý tiếng Việt tốt hơn công cụ khác, một số có giới hạn về độ dài văn bản đầu vào, một số miễn phí có giới hạn số lượt dùng trong ngày. Không có công cụ nào “tốt nhất tuyệt đối” cho mọi việc — chỉ có công cụ phù hợp hơn cho từng loại nhu cầu cụ thể.

Phân tích cách một công cụ AI hoạt động trong một ứng dụng cụ thể giúp hiểu rõ giới hạn của nó: ví dụ một công cụ tóm tắt văn bản có thể xử lý tốt văn bản dưới một độ dài nhất định, nhưng bắt đầu bỏ sót thông tin khi văn bản quá dài — hiểu được giới hạn này giúp dùng công cụ hiệu quả hơn thay vì kỳ vọng sai.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('046547c9-7460-458b-9562-73ce216626cf', v_m_m6_i_01, 'M6-I-01-04', 'Ví dụ minh họa', 'TEXT', 'Phòng kế toán cần hỗ trợ hai việc khác nhau: viết email nhắc nợ khách hàng (việc văn bản) và tìm quy luật bất thường trong một bảng 2.000 dòng giao dịch (việc phân tích dữ liệu). Dùng cùng một công cụ AI trò chuyện văn bản cho cả hai việc sẽ cho kết quả tốt ở việc đầu nhưng rất hạn chế ở việc sau — công cụ này không được tối ưu để xử lý bảng dữ liệu lớn. Chọn đúng công cụ phân tích dữ liệu chuyên biệt (có thể đọc file bảng tính trực tiếp) cho việc thứ hai sẽ hiệu quả hơn nhiều.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5696232a-e118-4232-bdbd-807e806386a0', v_m_m6_i_01, 'M6-I-01-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'So sánh 2-3 công cụ AI khác nhau cho cùng một tác vụ công việc cụ thể (ví dụ: tóm tắt văn bản, dịch thuật, hoặc tạo nội dung). Nhận xét công cụ nào phù hợp hơn và vì sao.

Sản phẩm nộp: Bảng so sánh công cụ AI (tiêu chí so sánh, kết quả từng công cụ, nhận xét).', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b6c1898b-9ca8-4a4e-8f8f-39ebb9157856', v_m_m6_i_01, 'M6-I-01-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao không nên dùng cùng một công cụ AI cho mọi loại việc? A. Không có sự khác biệt giữa các công cụ AI B. Mỗi công cụ được tối ưu cho loại tác vụ khác nhau, không có công cụ nào tốt nhất tuyệt đối C. Chỉ nên dùng công cụ đắt tiền nhất D. Công cụ miễn phí luôn kém hơn công cụ trả phí Đáp án: B — Mỗi công cụ AI có điểm mạnh riêng phù hợp với loại tác vụ khác nhau.

2. Hiểu giới hạn của một công cụ AI (ví dụ giới hạn độ dài văn bản xử lý) có ích gì? A. Không có ích gì thực tế B. Giúp dùng công cụ hiệu quả hơn, tránh kỳ vọng sai C. Chỉ để biết thông tin kỹ thuật D. Không liên quan đến công việc thực tế Đáp án: B — Hiểu giới hạn giúp sử dụng công cụ đúng cách và đạt kết quả tốt hơn.

3. Công cụ AI chuyên biệt khác công cụ AI đa năng như thế nào? A. Không có khác biệt gì B. Công cụ chuyên biệt được tối ưu cho một loại tác vụ cụ thể C. Công cụ chuyên biệt luôn đắt hơn D. Công cụ đa năng luôn tốt hơn công cụ chuyên biệt Đáp án: B — Đây là điểm khác biệt giúp lựa chọn công cụ phù hợp với nhu cầu.

4. Khi cần phân tích một bảng dữ liệu lớn, nên ưu tiên loại công cụ AI nào? A. Công cụ AI chuyên viết văn bản thông thường B. Công cụ AI chuyên phân tích dữ liệu, có thể đọc trực tiếp file bảng tính C. Bất kỳ công cụ nào cũng được D. Không nên dùng AI cho việc này Đáp án: B — Công cụ chuyên biệt cho phân tích dữ liệu sẽ xử lý hiệu quả hơn công cụ đa năng.

5. So sánh nhiều công cụ AI cho cùng một việc mang lại lợi ích gì? A. Không có lợi ích thực tế B. Giúp nhận biết công cụ nào phù hợp hơn với nhu cầu cụ thể C. Chỉ để tốn thời gian D. Luôn cho kết quả giống nhau nên không cần so sánh Đáp án: B — So sánh giúp đưa ra lựa chọn công cụ có căn cứ, phù hợp nhu cầu thực tế.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8bc644ed-9342-4ef0-b37e-e111c62e7b0d', v_m_m6_i_02, 'M6-I-02-01', 'Mục tiêu học tập', 'TEXT', '- Sử dụng được công cụ AI trong công việc hằng ngày

- Thực hành được kỹ năng sử dụng AI qua bài tập, dự án nhỏ

- Xem xét được khía cạnh đạo đức khi sử dụng AI, bảo đảm không vi phạm quyền riêng tư

- Tối ưu hóa được việc sử dụng công cụ AI để đạt hiệu quả cao hơn', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6422c3e5-dac2-4e56-ba17-47695b444d9c', v_m_m6_i_02, 'M6-I-02-02', 'Định nghĩa', 'TEXT', '- Sử dụng AI có trách nhiệm: việc áp dụng AI vào công việc có cân nhắc đến quyền riêng tư, tính chính xác, và ghi nhận rõ phần nào do AI hỗ trợ tạo ra

- Kỹ thuật đặt yêu cầu nâng cao (prompt engineering cơ bản): cách xây dựng yêu cầu có ngữ cảnh, ví dụ mẫu, và tiêu chí rõ ràng để cải thiện chất lượng kết quả AI', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9ce9ad31-3245-4fd6-8496-6139c0dbd94b', v_m_m6_i_02, 'M6-I-02-03', 'Nội dung', 'TEXT', 'Ở mức trung cấp, việc đặt yêu cầu (prompt) cần tinh chỉnh hơn mức cơ bản: cung cấp ngữ cảnh đầy đủ (ai là đối tượng đọc, mục đích sử dụng), đưa ra ví dụ mẫu nếu có (giúp AI hiểu đúng định dạng mong muốn), và chia nhỏ yêu cầu phức tạp thành các bước thay vì yêu cầu AI làm mọi thứ trong một lần.

Quy tắc bảo vệ dữ liệu khi dùng AI trong dự án cần cụ thể hơn mức cơ bản: xác định rõ loại dữ liệu nào tuyệt đối không được đưa vào công cụ AI (thông tin định danh khách hàng, số liệu tài chính chưa công bố, thông tin hợp đồng), và loại dữ liệu nào có thể dùng sau khi đã được ẩn danh hoặc tổng quát hóa.

Ghi nguồn khi dùng nội dung do AI tạo là thực hành có trách nhiệm cần hình thành: khi một phần đáng kể của tài liệu (báo cáo, bài viết, bản trình bày) được AI hỗ trợ tạo ra, nên ghi chú rõ ràng — điều này không chỉ minh bạch mà còn giúp người đọc biết cần kiểm tra kỹ hơn phần nào.

Tối ưu hóa việc sử dụng công cụ AI bao gồm việc học các tính năng nâng cao của công cụ đang dùng (lưu lại các yêu cầu hay dùng, tạo mẫu yêu cầu chuẩn cho công việc lặp lại), giúp tiết kiệm thời gian đáng kể so với việc gõ lại yêu cầu từ đầu mỗi lần.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('afa7924b-608f-43cf-a28b-04ea35b10795', v_m_m6_i_02, 'M6-I-02-04', 'Ví dụ minh họa', 'TEXT', 'Phòng marketing cần viết mười bài giới thiệu sản phẩm ngắn cho mười sản phẩm khác nhau. Thay vì đặt riêng lẻ mười yêu cầu khác nhau, nhân viên xây một mẫu yêu cầu chuẩn (nêu rõ cấu trúc: mở đầu gây chú ý, ba điểm nổi bật, lời kêu gọi hành động, giới hạn 100 từ) và chỉ thay tên/đặc điểm sản phẩm cho mỗi lần dùng. Kết quả đồng đều hơn, thời gian rút ngắn đáng kể. Tất cả các bài đều được ghi chú nội bộ “có hỗ trợ AI trong khâu viết nháp” trước khi chuyển cho người duyệt nội dung kiểm tra lại.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('f4b5d436-7218-4b08-b714-8ee95cd934e3', v_m_m6_i_02, 'M6-I-02-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Dùng AI hỗ trợ một dự án nhỏ của bộ phận (ví dụ: viết loạt nội dung, tổng hợp thông tin từ nhiều nguồn, soạn thảo tài liệu). Áp dụng quy tắc bảo vệ dữ liệu phù hợp trong quá trình thao tác, và ghi chú rõ phần nào có sự hỗ trợ của AI.

Sản phẩm nộp: Sản phẩm dự án nhỏ có hỗ trợ AI + ghi chú tuân thủ (loại dữ liệu đã dùng/tránh dùng, phần nào AI hỗ trợ).', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('5f949059-b8b3-471b-8289-aa443c3cf5bc', v_m_m6_i_02, 'M6-I-02-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Kỹ thuật đặt yêu cầu nâng cao ở mức trung cấp khác gì so với mức cơ bản? A. Không có gì khác biệt B. Cung cấp ngữ cảnh, ví dụ mẫu, chia nhỏ yêu cầu phức tạp thành các bước C. Chỉ cần viết ngắn gọn hơn D. Không cần nêu rõ mục đích sử dụng Đáp án: B — Đây là các kỹ thuật giúp cải thiện chất lượng kết quả AI ở mức nâng cao hơn.

2. Vì sao nên ghi nguồn khi một phần đáng kể tài liệu được AI hỗ trợ tạo ra? A. Không cần thiết B. Minh bạch và giúp người đọc biết cần kiểm tra kỹ hơn phần nào C. Chỉ để tuân thủ hình thức D. Làm chậm quá trình làm việc Đáp án: B — Đây là thực hành có trách nhiệm, hỗ trợ việc kiểm tra chất lượng sau này.

3. Tạo mẫu yêu cầu chuẩn cho công việc lặp lại mang lại lợi ích gì? A. Không có lợi ích gì B. Tiết kiệm thời gian và cho kết quả đồng đều hơn so với gõ lại từ đầu mỗi lần C. Chỉ làm phức tạp thêm quy trình D. Chỉ phù hợp với công việc một lần Đáp án: B — Mẫu chuẩn giúp tăng hiệu quả cho các công việc có tính lặp lại.

4. Loại dữ liệu nào tuyệt đối không nên đưa vào công cụ AI công cộng khi làm dự án? A. Nội dung đã công khai trên website công ty B. Thông tin định danh khách hàng, số liệu tài chính chưa công bố C. Tiêu đề bài viết chung chung D. Cấu trúc một bài viết mẫu Đáp án: B — Đây là dữ liệu nhạy cảm cần được bảo vệ nghiêm ngặt.

5. Sử dụng AI có trách nhiệm bao gồm điều gì? A. Chỉ cần dùng AI càng nhiều càng tốt B. Cân nhắc quyền riêng tư, tính chính xác, và ghi nhận rõ phần AI hỗ trợ tạo ra C. Không cần quan tâm đến quyền riêng tư D. Chỉ áp dụng khi có yêu cầu từ cấp trên Đáp án: B — Đây là các yếu tố cốt lõi của việc sử dụng AI có trách nhiệm trong công việc.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('86cb8339-fd8c-4890-bc85-1cd1c6526214', v_m_m6_i_03, 'M6-I-03-01', 'Mục tiêu học tập', 'TEXT', '- Phân tích được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể

- So sánh được hiệu suất của các hệ thống AI khác nhau

- Đánh giá được độ chính xác và tin cậy của các hệ thống AI

- Xem xét được kết quả và đưa ra nhận xét về hiệu quả của hệ thống AI', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ae9f73a4-a8f9-4040-a189-cc847073646c', v_m_m6_i_03, 'M6-I-03-02', 'Định nghĩa', 'TEXT', '- Độ chính xác (accuracy) của AI: mức độ kết quả AI đưa ra khớp với thực tế hoặc kỳ vọng đúng

- Thiên lệch (bias) trong AI: xu hướng hệ thống AI cho kết quả lệch theo một hướng nhất định do dữ liệu huấn luyện không đại diện đầy đủ', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('02974f62-0a2a-47e2-95ec-663e389e3fc0', v_m_m6_i_03, 'M6-I-03-03', 'Nội dung', 'TEXT', 'Đánh giá hiệu quả của một hệ thống AI trong công việc cần dựa trên tiêu chí cụ thể, không chỉ cảm nhận chung chung “thấy hay” hay “thấy dở”. Các tiêu chí thực tế bao gồm: độ chính xác của kết quả so với việc tự làm thủ công, thời gian tiết kiệm được, mức độ cần chỉnh sửa lại trước khi dùng, và tính nhất quán khi lặp lại nhiều lần cho cùng loại việc.

So sánh hiệu suất giữa các hệ thống AI khác nhau cho cùng một loại việc giúp xác định công cụ nào thực sự phù hợp với nhu cầu của bộ phận, thay vì chọn theo cảm tính hoặc theo công cụ đang được nhắc đến nhiều.

Thiên lệch (bias) là vấn đề cần lưu ý khi đánh giá AI: nếu dữ liệu huấn luyện của một hệ thống AI không đại diện đầy đủ (ví dụ chủ yếu dữ liệu tiếng Anh, ít dữ liệu tiếng Việt hoặc bối cảnh Việt Nam), kết quả có thể kém chính xác hoặc kém phù hợp hơn khi áp dụng vào bối cảnh trong nước — đây là điều cần kiểm tra khi đánh giá độ tin cậy của một công cụ trước khi áp dụng rộng rãi.

Đưa ra nhận xét có căn cứ về hiệu quả AI đòi hỏi ghi lại số liệu cụ thể (không chỉ ấn tượng chủ quan): ví dụ “công cụ A tiết kiệm khoảng 30% thời gian so với làm thủ công, nhưng cần chỉnh sửa lại khoảng 20% nội dung trước khi dùng” là nhận xét có căn cứ hơn nhiều so với “công cụ A dùng khá ổn”.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('4cce5309-04da-47e7-98a9-71a5cc2a4b6d', v_m_m6_i_03, 'M6-I-03-04', 'Ví dụ minh họa', 'TEXT', 'Phòng nhân sự thử nghiệm dùng AI để sàng lọc sơ yếu lý lịch ứng viên. Sau một tháng thử nghiệm, họ ghi nhận: AI tiết kiệm được khoảng 40% thời gian đọc sơ bộ, nhưng có xu hướng đánh giá thấp hơn các ứng viên có cách trình bày sơ yếu lý lịch không theo mẫu chuẩn phổ biến — một dạng thiên lệch do dữ liệu huấn luyện. Nhận ra điều này, phòng nhân sự quyết định dùng AI như bước sàng lọc sơ bộ hỗ trợ, không phải công cụ quyết định cuối cùng, và vẫn có người xem lại toàn bộ hồ sơ bị AI đánh giá thấp trước khi loại.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('9346ecd7-e2c7-4391-b870-4020312f8631', v_m_m6_i_03, 'M6-I-03-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Đánh giá độ chính xác/tin cậy của một kết quả AI tạo ra cho một việc công việc cụ thể. Chỉ ra điểm cần kiểm tra lại hoặc chỉnh sửa trước khi dùng chính thức.

Sản phẩm nộp: Bản đánh giá kết quả AI (tiêu chí đánh giá, kết quả, điểm cần chỉnh sửa).', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('6013ed7c-1801-4a83-9fcd-4ed3322d7b91', v_m_m6_i_03, 'M6-I-03-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Đánh giá hiệu quả AI nên dựa trên điều gì? A. Chỉ cần cảm nhận chung chung B. Tiêu chí cụ thể: độ chính xác, thời gian tiết kiệm, mức cần chỉnh sửa, tính nhất quán C. Chỉ dựa vào độ nổi tiếng của công cụ D. Không cần đánh giá, cứ dùng là được Đáp án: B — Đánh giá có căn cứ cần dựa trên các tiêu chí đo lường được.

2. Thiên lệch (bias) trong AI xuất phát từ đâu? A. Không có nguyên nhân cụ thể B. Dữ liệu huấn luyện không đại diện đầy đủ cho các nhóm hoặc bối cảnh khác nhau C. Chỉ do lỗi kỹ thuật ngẫu nhiên D. Chỉ xảy ra với công cụ miễn phí Đáp án: B — Thiên lệch phản ánh sự thiếu đại diện trong dữ liệu dùng để huấn luyện hệ thống.

3. Vì sao cần kiểm tra thiên lệch khi áp dụng AI cho bối cảnh Việt Nam? A. Không cần thiết B. Nhiều hệ thống AI huấn luyện chủ yếu trên dữ liệu tiếng Anh, có thể kém phù hợp với bối cảnh trong nước C. Chỉ cần dùng công cụ tiếng Việt là đủ D. Thiên lệch không ảnh hưởng đến kết quả thực tế Đáp án: B — Sự thiếu đại diện trong dữ liệu huấn luyện có thể ảnh hưởng đến độ phù hợp khi áp dụng vào bối cảnh cụ thể.

4. Nhận xét nào sau đây có căn cứ hơn khi đánh giá AI? A. “Công cụ này dùng khá ổn” B. “Công cụ tiết kiệm 30% thời gian nhưng cần chỉnh sửa lại 20% nội dung” C. “Công cụ này rất tốt” D. “Không có ý kiến gì đặc biệt” Đáp án: B — Nhận xét có số liệu cụ thể mang tính căn cứ, có thể so sánh và ra quyết định dựa trên đó.

5. Trong ví dụ sàng lọc sơ yếu lý lịch bằng AI, cách xử lý thiên lệch phù hợp là gì? A. Ngừng hoàn toàn việc dùng AI B. Dùng AI như bước sàng lọc sơ bộ hỗ trợ, vẫn có người xem lại các trường hợp bị đánh giá thấp C. Tin tưởng hoàn toàn kết quả AI D. Không cần điều chỉnh gì Đáp án: B — Đây là cách cân bằng giữa tận dụng hiệu quả của AI và kiểm soát rủi ro thiên lệch.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('8c479095-fccd-4f05-a87a-a51427af3f4e', v_m_m6_a_01, 'M6-A-01-01', 'Mục tiêu học tập', 'TEXT', '- Đánh giá được hiệu quả của hệ thống AI trong việc giải quyết vấn đề cụ thể

- Kiểm tra được giới hạn và tiềm năng của AI trong các lĩnh vực khác nhau

- Tổng hợp được kiến thức để đề xuất cải tiến cho các hệ thống AI

- Thiết kế được giải pháp AI phù hợp cho vấn đề phức tạp của tổ chức', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b94a0c98-304d-443d-b49f-aca71e6c30a1', v_m_m6_a_01, 'M6-A-01-02', 'Định nghĩa', 'TEXT', '- Cường điệu công nghệ (hype): hiện tượng một công nghệ được truyền thông và thị trường thổi phồng vượt quá khả năng thực tế của nó tại thời điểm hiện tại

- Điểm phù hợp ứng dụng (use-case fit): mức độ một công nghệ AI cụ thể thực sự giải quyết đúng vấn đề của tổ chức, không chỉ vì đang là xu hướng', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('db5721a7-8896-4584-bb34-29b0502742f7', v_m_m6_a_01, 'M6-A-01-03', 'Nội dung', 'TEXT', 'Đánh giá cơ hội ứng dụng AI ở cấp tổ chức đòi hỏi phân biệt rõ giữa cường điệu công nghệ và giá trị thực tế. Không phải mọi quy trình đều cần hoặc nên tích hợp AI — câu hỏi cốt lõi cần trả lời trước tiên là “AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp hay không”, chứ không phải “mọi người đang nói về AI nên chúng ta cũng nên dùng”.

Xu hướng ứng dụng AI theo ngành khác nhau đáng kể: một số ngành (nội dung, marketing) có nhiều điểm ứng dụng AI trưởng thành và dễ tiếp cận; một số ngành khác (sản xuất, hậu cần) cần đầu tư hạ tầng lớn hơn để ứng dụng AI hiệu quả. Hiểu rõ vị trí ngành của doanh nghiệp mình trong bức tranh này giúp đặt kỳ vọng thực tế.

Kiểm tra giới hạn và tiềm năng của AI trong một lĩnh vực cụ thể của doanh nghiệp cần dựa trên bằng chứng — thử nghiệm thực tế, không chỉ dựa vào lời quảng cáo của nhà cung cấp công nghệ. Một cách tiếp cận có kỷ luật là: xác định rõ vấn đề, thử nghiệm AI trên quy mô nhỏ, đo lường kết quả bằng số liệu cụ thể, rồi mới quyết định mở rộng.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('cd5d19be-acc8-4258-8199-e4ee12ba2988', v_m_m6_a_01, 'M6-A-01-04', 'Ví dụ minh họa', 'TEXT', 'Ban giám đốc một công ty thương mại nghe nhiều về AI tạo hình ảnh và cân nhắc đầu tư lớn để tự động hóa toàn bộ khâu thiết kế hình ảnh sản phẩm. Trước khi quyết định, bộ phận phụ trách đánh giá thực tế: thử nghiệm AI tạo hình ảnh cho 20 sản phẩm trong một tháng, đo lường tỷ lệ hình ảnh dùng được ngay (45%), tỷ lệ cần chỉnh sửa nhiều (35%), tỷ lệ không dùng được (20%), và thời gian tiết kiệm thực tế so với thuê thiết kế ngoài. Kết quả cho thấy AI phù hợp làm bước tạo bản nháp ban đầu, không thể thay thế hoàn toàn công đoạn thiết kế — một kết luận thực tế hơn nhiều so với kỳ vọng ban đầu dựa trên cường điệu công nghệ.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('2fdc70a1-de55-4e9d-8be3-6cda1c18c7b9', v_m_m6_a_01, 'M6-A-01-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Đánh giá một cơ hội ứng dụng AI cụ thể cho một quy trình của doanh nghiệp. Xác định rõ vấn đề cần giải quyết, đánh giá điểm phù hợp ứng dụng, và đề xuất cách thử nghiệm quy mô nhỏ trước khi mở rộng.

Sản phẩm nộp: Báo cáo đánh giá cơ hội ứng dụng AI (vấn đề, điểm phù hợp, đề xuất thử nghiệm).', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('561829d6-3c52-4f25-aca3-343f3eaa2199', v_m_m6_a_01, 'M6-A-01-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Câu hỏi cốt lõi cần trả lời trước khi ứng dụng AI vào một quy trình là gì? A. “Mọi người đang dùng AI nên chúng ta cũng nên dùng” B. “AI có thực sự giải quyết một vấn đề cụ thể, đo lường được của doanh nghiệp không” C. “Công cụ AI nào đắt tiền nhất” D. “Đối thủ cạnh tranh có dùng AI không” Đáp án: B — Đây là câu hỏi cốt lõi giúp tránh đầu tư theo cường điệu công nghệ.

2. Cường điệu công nghệ (hype) là gì? A. Một loại công nghệ AI mới B. Hiện tượng một công nghệ được thổi phồng vượt quá khả năng thực tế C. Một phương pháp đánh giá hiệu quả D. Một loại dữ liệu huấn luyện Đáp án: B — Đây là hiện tượng cần nhận biết để tránh quyết định đầu tư sai lệch.

3. Cách tiếp cận có kỷ luật khi đánh giá ứng dụng AI là gì? A. Đầu tư ngay lập tức vào quy mô lớn B. Xác định vấn đề, thử nghiệm quy mô nhỏ, đo lường bằng số liệu, rồi mới quyết định mở rộng C. Chỉ dựa vào lời quảng cáo của nhà cung cấp D. Không cần đánh giá, cứ triển khai Đáp án: B — Đây là quy trình đánh giá có bằng chứng, giảm rủi ro đầu tư sai.

4. Trong ví dụ về AI tạo hình ảnh sản phẩm, kết luận thực tế sau thử nghiệm là gì? A. AI hoàn toàn thay thế được thiết kế viên B. AI phù hợp làm bước tạo bản nháp ban đầu, không thay thế hoàn toàn công đoạn thiết kế C. AI hoàn toàn không có giá trị D. Không có kết luận rõ ràng Đáp án: B — Đây là kết luận thực tế, cân bằng dựa trên số liệu thử nghiệm, khác với kỳ vọng ban đầu.

5. Vì sao xu hướng ứng dụng AI khác nhau giữa các ngành? A. Không có sự khác biệt nào B. Mức độ trưởng thành và dễ tiếp cận của điểm ứng dụng AI khác nhau theo ngành C. Chỉ do sở thích của lãnh đạo doanh nghiệp D. AI chỉ áp dụng được cho một ngành duy nhất Đáp án: B — Sự khác biệt về đặc thù ngành ảnh hưởng đến mức độ và cách ứng dụng AI phù hợp.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('350714af-b5ab-4850-b0f2-7280ab97d930', v_m_m6_a_02, 'M6-A-02-01', 'Mục tiêu học tập', 'TEXT', '- Phát triển được ứng dụng AI tùy chỉnh để giải quyết vấn đề cụ thể

- Điều chỉnh được hệ thống AI để phù hợp với nhu cầu cụ thể

- Đánh giá và giảm thiểu được các rủi ro đạo đức và pháp lý liên quan đến việc sử dụng AI

- Tích hợp được công cụ AI vào quy trình làm việc hiện có', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('bdd0947f-540e-42de-8233-fb140a409744', v_m_m6_a_02, 'M6-A-02-02', 'Định nghĩa', 'TEXT', '- Quy tắc sử dụng AI nội bộ: văn bản do doanh nghiệp ban hành quy định rõ ai được dùng AI cho việc gì, dữ liệu nào không được đưa vào, và trách nhiệm khi có sai sót

- Trách nhiệm giải trình (accountability): nguyên tắc con người vẫn phải chịu trách nhiệm cuối cùng về quyết định, kể cả khi quyết định đó có sự hỗ trợ của AI', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('80148e2f-9d10-42a8-a0cc-326a05db45b0', v_m_m6_a_02, 'M6-A-02-03', 'Nội dung', 'TEXT', 'Xây quy tắc sử dụng AI cho bộ phận hoặc toàn doanh nghiệp là bước cần thiết khi việc dùng AI trở nên phổ biến, không còn là hoạt động cá nhân tự phát. Quy tắc này cần nêu rõ: những công cụ AI nào đã được phê duyệt sử dụng, loại dữ liệu nào tuyệt đối không được đưa vào bất kỳ công cụ AI nào, quy trình phê duyệt khi muốn dùng một công cụ AI mới, và ai chịu trách nhiệm khi có sai sót phát sinh từ việc dùng AI.

Nguyên tắc trách nhiệm giải trình cần được khẳng định rõ ràng: dù một quyết định có sự hỗ trợ hoặc gợi ý từ AI, người ra quyết định cuối cùng vẫn là con người và vẫn phải chịu trách nhiệm về quyết định đó. “AI gợi ý như vậy” không phải là lý do biện minh hợp lệ khi có sai sót xảy ra — đây là nguyên tắc quan trọng cần được quán triệt trong văn hóa sử dụng AI của tổ chức.

Rủi ro pháp lý khi dùng nội dung AI tạo cho mục đích thương mại cần được đánh giá cẩn trọng: vấn đề quyền sở hữu nội dung do AI tạo ra hiện vẫn là vùng pháp lý chưa hoàn toàn rõ ràng ở nhiều nơi, và một số công cụ AI có thể tạo ra nội dung gần giống với tài liệu có bản quyền đã tồn tại mà không có cảnh báo. Doanh nghiệp nên thận trọng khi dùng nội dung AI tạo cho các mục đích thương mại quan trọng (logo, khẩu hiệu thương hiệu chính thức) và có bước rà soát trước khi công bố chính thức.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b39fa91f-5b6a-42a5-a40d-8b8d78e5458c', v_m_m6_a_02, 'M6-A-02-04', 'Ví dụ minh họa', 'TEXT', 'Sau vài tháng nhân viên các phòng ban tự phát dùng nhiều công cụ AI khác nhau không kiểm soát, ban giám đốc một doanh nghiệp nhận thấy rủi ro: có trường hợp một nhân viên đã dán một phần hợp đồng khách hàng vào công cụ AI công cộng để “tóm tắt cho nhanh”. Doanh nghiệp ban hành quy tắc sử dụng AI nội bộ: chỉ định hai công cụ AI đã được phê duyệt và đánh giá an toàn dữ liệu, cấm tuyệt đối đưa hợp đồng/thông tin tài chính khách hàng vào bất kỳ công cụ AI nào chưa được phê duyệt, và yêu cầu mọi nội dung công khai ra bên ngoài (bài đăng, tài liệu marketing) có hỗ trợ AI phải qua một người kiểm duyệt trước khi công bố.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('fd3e66bf-afec-476d-9b3d-cb3795b114b6', v_m_m6_a_02, 'M6-A-02-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Soạn dự thảo quy tắc sử dụng AI có trách nhiệm cho bộ phận hoặc doanh nghiệp, bao gồm: công cụ được phê duyệt, dữ liệu cấm đưa vào AI, quy trình phê duyệt công cụ mới, và trách nhiệm giải trình.

Sản phẩm nộp: Dự thảo quy tắc sử dụng AI (văn bản, tối thiểu các mục nêu trên).', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('826d4e45-1158-42b2-9462-1afc396798da', v_m_m6_a_02, 'M6-A-02-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Nguyên tắc trách nhiệm giải trình trong sử dụng AI nghĩa là gì? A. AI chịu trách nhiệm hoàn toàn về quyết định B. Con người vẫn chịu trách nhiệm cuối cùng về quyết định, dù có sự hỗ trợ từ AI C. Không ai chịu trách nhiệm khi có sai sót D. Trách nhiệm thuộc về nhà cung cấp công cụ AI Đáp án: B — Đây là nguyên tắc quan trọng, “AI gợi ý vậy” không phải lý do biện minh hợp lệ.

2. Quy tắc sử dụng AI nội bộ cần nêu rõ những gì? A. Chỉ cần nêu tên công cụ AI B. Công cụ được phê duyệt, dữ liệu cấm đưa vào, quy trình phê duyệt, trách nhiệm khi sai sót C. Không cần văn bản chính thức D. Chỉ áp dụng cho cấp quản lý Đáp án: B — Đây là các nội dung cốt lõi cần có trong quy tắc sử dụng AI nội bộ.

3. Vì sao cần thận trọng khi dùng nội dung AI tạo cho mục đích thương mại quan trọng? A. Không cần thận trọng gì B. Vấn đề quyền sở hữu nội dung AI tạo ra còn chưa hoàn toàn rõ ràng về pháp lý C. Nội dung AI tạo luôn có bản quyền rõ ràng D. Chỉ cần thận trọng với nội dung miễn phí Đáp án: B — Đây là vùng pháp lý còn đang phát triển, cần thận trọng để tránh rủi ro.

4. Trong ví dụ về hợp đồng khách hàng bị dán vào công cụ AI công cộng, bài học rút ra là gì? A. Không nên dùng AI nữa B. Cần có quy tắc rõ ràng về công cụ được phép dùng và dữ liệu cấm đưa vào C. Chỉ cần nhắc nhở nhân viên bằng miệng D. Không có bài học gì đặc biệt Đáp án: B — Sự cố này cho thấy cần có quy tắc chính thức thay vì để nhân viên tự phát quyết định.

5. Nội dung công khai ra bên ngoài có hỗ trợ AI nên được xử lý như thế nào trước khi công bố? A. Công bố ngay không cần kiểm tra B. Qua một người kiểm duyệt trước khi công bố chính thức C. Chỉ cần AI tự kiểm tra D. Không cần quy trình gì đặc biệt Đáp án: B — Bước kiểm duyệt con người giúp giảm rủi ro về nội dung sai lệch hoặc vi phạm bản quyền.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('ea5a601a-1d87-44a8-b033-ee26cb527c80', v_m_m6_a_03, 'M6-A-03-01', 'Mục tiêu học tập', 'TEXT', '- Phê phán được các khía cạnh kỹ thuật và đạo đức của hệ thống AI

- Kiểm tra và xác minh được tính chính xác của các quyết định do hệ thống AI đưa ra

- Đưa ra được khuyến nghị cải tiến cho hệ thống AI dựa trên kết quả đánh giá

- Phát triển được tiêu chuẩn và hướng dẫn đánh giá hệ thống AI cho tổ chức', 1, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('95532650-ea62-462f-98cc-4ab5677b0c8f', v_m_m6_a_03, 'M6-A-03-02', 'Định nghĩa', 'TEXT', '- Tiêu chí đánh giá công cụ AI: bộ tiêu chuẩn có hệ thống dùng để so sánh và lựa chọn công cụ AI trước khi đưa vào sử dụng chính thức trong tổ chức

- Thử nghiệm có kiểm soát (pilot): việc áp dụng một công cụ AI ở phạm vi hạn chế, có đo lường kết quả, trước khi quyết định mở rộng toàn tổ chức', 2, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('adc373fc-8787-4309-96a6-ab2aab17dd64', v_m_m6_a_03, 'M6-A-03-03', 'Nội dung', 'TEXT', 'Xây bộ tiêu chí đánh giá có hệ thống để lựa chọn công cụ AI cho tổ chức giúp tránh quyết định theo cảm tính hoặc theo quảng cáo của nhà cung cấp. Các tiêu chí nên bao gồm: độ chính xác trên bài kiểm tra thử với dữ liệu thật của tổ chức, mức độ bảo mật dữ liệu của nhà cung cấp (dữ liệu có được dùng để huấn luyện lại không, có được lưu trữ ở đâu), chi phí và mô hình tính phí, khả năng tích hợp với hệ thống hiện có, và chất lượng hỗ trợ kỹ thuật.

Quy trình thử nghiệm có kiểm soát trước khi áp dụng rộng là bước không thể bỏ qua: chọn một nhóm nhỏ người dùng, một phạm vi công việc giới hạn, chạy thử trong một khoảng thời gian xác định, thu thập phản hồi và số liệu cụ thể, rồi mới quyết định có mở rộng hay không. Cách làm này giảm thiểu rủi ro nếu công cụ không phù hợp như kỳ vọng, đồng thời tạo ra bằng chứng cụ thể để thuyết phục các bên liên quan khi cần mở rộng đầu tư.

Phát triển hướng dẫn đánh giá không chỉ dừng ở việc chọn công cụ ban đầu — cần có cơ chế đánh giá định kỳ sau khi đã triển khai, vì cả nhu cầu của tổ chức và bản thân công nghệ AI đều thay đổi nhanh, một công cụ phù hợp hôm nay có thể không còn là lựa chọn tốt nhất sau một năm.', 3, true, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('b4e4771f-8fa5-47c2-b4ec-fa87aa72e61a', v_m_m6_a_03, 'M6-A-03-04', 'Ví dụ minh họa', 'TEXT', 'Một doanh nghiệp cân nhắc giữa ba công cụ AI hỗ trợ chăm sóc khách hàng qua chat. Thay vì chọn theo tên tuổi thương hiệu, bộ phận phụ trách xây bảng tiêu chí có trọng số: độ chính xác khi trả lời 50 câu hỏi thường gặp thực tế của khách hàng (30%), chính sách bảo mật dữ liệu hội thoại khách hàng (30%), chi phí theo số lượng hội thoại (20%), khả năng tích hợp với hệ thống quản lý khách hàng hiện có (20%). Sau khi chấm điểm khách quan theo bảng này, họ chọn công cụ xếp thứ hai về độ chính xác nhưng có chính sách bảo mật dữ liệu rõ ràng và minh bạch nhất — một quyết định có căn cứ, không chỉ dựa vào một tiêu chí duy nhất.', 4, false, 'VIEW', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('943f14e4-d76f-47c7-8d92-db89ca3bd172', v_m_m6_a_03, 'M6-A-03-05', 'Bài thực hành', 'GUIDED_PRACTICE', 'Xây bộ tiêu chí đánh giá có trọng số để lựa chọn công cụ AI áp dụng cho một nhu cầu cụ thể của doanh nghiệp, và thiết kế kế hoạch thử nghiệm có kiểm soát trước khi mở rộng.

Sản phẩm nộp: Bộ tiêu chí đánh giá công cụ AI (có trọng số) + kế hoạch thử nghiệm có kiểm soát.', 5, true, 'SUBMIT_ACTIVITY', 'ACTIVE', now(), now());
  INSERT INTO lessons (id, module_id, code, title, lesson_type, content_body, sort_order, is_required, completion_rule, status, created_at, updated_at)
  VALUES ('7bc1166a-cfba-4b8b-b685-f7e5ce62e977', v_m_m6_a_03, 'M6-A-03-06', 'Câu hỏi ôn tập', 'QUIZ', '1. Vì sao nên xây bộ tiêu chí đánh giá có hệ thống thay vì chọn công cụ AI theo cảm tính? A. Không có sự khác biệt về kết quả B. Tránh quyết định theo quảng cáo, đảm bảo lựa chọn có căn cứ khách quan C. Chỉ để tốn thêm thời gian D. Không cần thiết nếu công cụ nổi tiếng Đáp án: B — Tiêu chí có hệ thống giúp đưa ra quyết định khách quan, có thể giải trình được.

2. Thử nghiệm có kiểm soát (pilot) trước khi áp dụng rộng có lợi ích gì? A. Không có lợi ích cụ thể B. Giảm rủi ro nếu công cụ không phù hợp, tạo bằng chứng cụ thể để quyết định mở rộng C. Chỉ làm chậm quá trình triển khai D. Không cần thiết nếu đã có tiêu chí đánh giá Đáp án: B — Thử nghiệm nhỏ cung cấp bằng chứng thực tế trước khi đầu tư quy mô lớn.

3. Trong ví dụ chọn công cụ AI chăm sóc khách hàng, vì sao doanh nghiệp không chọn công cụ có độ chính xác cao nhất? A. Do nhầm lẫn trong đánh giá B. Vì đánh giá tổng thể theo nhiều tiêu chí có trọng số, không chỉ dựa vào một tiêu chí duy nhất C. Vì công cụ đó đắt hơn D. Không có lý do cụ thể Đáp án: B — Quyết định dựa trên đánh giá đa tiêu chí, cân bằng giữa độ chính xác và bảo mật dữ liệu.

4. Vì sao cần đánh giá định kỳ công cụ AI sau khi đã triển khai, không chỉ đánh giá một lần ban đầu? A. Không cần thiết một khi đã chọn xong B. Nhu cầu tổ chức và công nghệ AI đều thay đổi nhanh, công cụ phù hợp hôm nay có thể không còn tốt nhất sau này C. Chỉ để tăng thêm công việc D. Không có lý do liên quan đến hiệu quả Đáp án: B — Đánh giá định kỳ đảm bảo công cụ đang dùng vẫn là lựa chọn phù hợp nhất theo thời gian.

5. Tiêu chí nào sau đây nên có trong bộ đánh giá công cụ AI cho tổ chức? A. Chỉ cần xem giá cả B. Độ chính xác, bảo mật dữ liệu, chi phí, khả năng tích hợp, chất lượng hỗ trợ kỹ thuật C. Chỉ cần độ nổi tiếng của thương hiệu D. Chỉ cần ý kiến của một người quyết định Đáp án: B — Đây là các tiêu chí toàn diện giúp đánh giá công cụ AI một cách khách quan và đầy đủ.', 6, true, 'PASS_CHECK', 'ACTIVE', now(), now());

END $$;

COMMIT;

-- Summary: 18 courses, 72 modules, 369 lessons
