# VKey Browser

> [!WARNING]
> Đây là tính năng thử nghiệm, hiện chưa phát hành trên Chrome Web Store hoặc
> Firefox AMO.

Extension đồng hành cho [VKey](https://github.com/phatMT97/VKey), cho phép tự
chuyển chế độ theo website. Extension chỉ gửi hostname của tab đang focus và
route đã resolve tới native host; không gửi URL đầy đủ, path, query, nội dung
trang hoặc phím gõ.

## Các chế độ

- **Theo VKey** — dùng trạng thái và cấu hình VKey bình thường.
- **English** — tạm bỏ xử lý tiếng Việt trên tên miền này.
- **TSF tương thích** — dùng TSF trên editor/forum bị dính chữ sau emoji
  ([VKey #92](https://github.com/phatMT97/VKey/issues/92)); cần bật hỗ trợ ứng
  dụng TSF trong VKey.

## Yêu cầu

- Windows 10/11.
- Một bản VKey có `VKeyBrowserHost.exe` nằm cạnh `VKey.exe` hoặc
  `VKeyClassic.exe`.
- Chạy VKey ít nhất một lần sau khi đặt các file cạnh nhau để đăng ký native
  messaging host.

## Cài trên Chrome, Edge, Brave, Vivaldi hoặc Opera

1. Tải repo bằng **Code → Download ZIP** và giải nén.
2. Mở `chrome://extensions`, `edge://extensions`, `brave://extensions`,
   `vivaldi://extensions` hoặc `opera://extensions`.
3. Bật **Developer mode** và chọn **Load unpacked**.
4. Chọn thư mục vừa giải nén, nơi chứa `manifest.json`.
5. Ghim VKey Browser lên toolbar.

## Cài tạm trên Firefox

1. Mở `about:debugging#/runtime/this-firefox`.
2. Chọn **Load Temporary Add-on**.
3. Chọn `manifest.json` trong repo này.

Firefox sẽ gỡ temporary add-on sau khi khởi động lại; cần load lại cho đến khi
có bản XPI được ký qua AMO.

## Sử dụng

Mở website, bấm icon VKey Browser và chọn route. Rule tự cập nhật khi chuyển
tab, navigation hoặc đổi cửa sổ.

Công tắc **Bật điều hướng theo website** được bật mặc định. Tắt công tắc để tạm
ngừng áp dụng mọi rule mà không xóa cấu hình; VKey sẽ trở về hành vi bình thường.

Ví dụ: giữ VKey gốc ở V, để `google.com` là **Theo VKey** và đặt `voz.vn` là
**English**. Chuyển qua lại hai tab sẽ tự đổi V → E → V. English chỉ là overlay
tạm thời và không làm mất trạng thái V/E gốc.

Nếu extension không kết nối, kiểm tra `VKeyBrowserHost.exe`, thoát/mở lại VKey,
sau đó restart browser và reload extension. Hướng dẫn chi tiết nằm tại
[VKey browser extension guide](https://github.com/phatMT97/VKey/blob/Main/docs/BROWSER_EXTENSION.md).

## Development

1. Install a VKey build containing `VKeyBrowserHost.exe` and restart VKey once.
2. Open the browser's extension developer page and load this directory unpacked.
3. Use the toolbar popup to set the current domain, or the options page to edit
   all rules.

Chromium development ID: `ccmggbcabaknpjielbiioolpfnpfgkbi`.
Firefox ID: `browser@vkey.phatmt97.github.io`.

Run tests with `npm test` (no dependencies are installed).

## Giới hạn đã biết

Extension không thể đọc text đang gõ trong address bar/omnibox thông thường.
Vì vậy rule chỉ có hiệu lực sau navigation hoặc khi tab đã có hostname; không
thể phát hiện `google.com` khi người dùng còn đang gõ trước navigation
([VKey #100](https://github.com/phatMT97/VKey/issues/100)).
