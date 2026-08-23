# VKey Browser

> [!WARNING]
> Đây là tính năng thử nghiệm, hiện chưa phát hành trên Chrome Web Store hoặc
> Firefox AMO.

Extension đồng hành cho [VKey](https://github.com/phatMT97/VKey), tự nhớ chế độ
V/E theo website trong phiên browser và cho phép đặt rule hard. Extension chỉ
trao đổi hostname, route cấu hình và kết quả V/E sau hotkey với native host;
không gửi URL đầy đủ, path, query, nội dung trang hay phím đã gõ.

## Các chế độ

- **Tự nhớ V/E theo hotkey** — khi đổi V/E bằng hotkey VKey, extension nhớ kết
  quả cho hostname và tự khôi phục khi quay lại trong cùng phiên browser.
- **English (hard)** — luôn bỏ xử lý tiếng Việt và không cho hotkey thay đổi
  trạng thái đã nhớ của tên miền này.
- **TSF tương thích (hard)** — luôn dùng TSF trên editor/forum bị dính chữ sau emoji
  ([VKey #92](https://github.com/phatMT97/VKey/issues/92)); cần bật hỗ trợ ứng
  dụng TSF trong VKey.

Trạng thái V/E tự học được lưu bằng `storage.session`, nên tự xóa khi browser
đóng/restart. Rule hard nằm trong `storage.local` và vẫn còn ở lần mở sau.

## Yêu cầu

- Windows 10/11.
- Một bản VKey hỗ trợ native protocol 2, có `VKeyBrowserHost.exe` nằm cạnh
  `VKey.exe` hoặc `VKeyClassic.exe`.
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

Firefox chưa hỗ trợ `background.service_worker` của Manifest V3, nên cần build
gói có `background.scripts` riêng:

1. Chạy `npm run build:firefox` trong thư mục repo.
2. Mở `about:debugging#/runtime/this-firefox`.
3. Chọn **Load Temporary Add-on**.
4. Chọn `dist/firefox/manifest.json`.

Firefox sẽ gỡ temporary add-on sau khi khởi động lại; cần load lại cho đến khi
có bản XPI được ký qua AMO.

## Sử dụng

Mở website rồi dùng hotkey V/E của VKey như bình thường. Extension nhận trạng
thái kết quả từ native host, nhớ nó cho hostname hiện tại và tự áp dụng khi
chuyển tab, navigation hoặc đổi cửa sổ.

Trong popup, chọn **Luôn gõ English (hard)** hoặc **TSF tương thích (hard)** khi
muốn cấu hình cố định. Chọn **Tự nhớ V/E theo hotkey** để bỏ rule hard và quay
lại chế độ tự học trong phiên.

Công tắc **Bật điều hướng theo website** được bật mặc định. Tắt công tắc để tạm
ngừng cả trạng thái theo phiên lẫn rule hard mà không xóa chúng; VKey sẽ trở về
hành vi bình thường.

Ví dụ: tại `google.com` nhấn hotkey để chuyển sang V, tại `github.com` nhấn
hotkey để chuyển sang E. Trong phiên hiện tại, chuyển qua lại hai tab sẽ tự đổi
V → E → V. Nếu đặt `voz.vn` là **English (hard)** thì hostname đó luôn ở E và
không ghi đè trạng thái V/E đã học.

Popup hiển thị **Đã kết nối VKey** khi native host hoạt động. Nếu thấy **Chưa
kết nối VKeyBrowserHost**, kiểm tra `VKeyBrowserHost.exe`, thoát/mở lại VKey,
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

### Native messaging protocol 2

Context extension gửi cho host có thêm `mode`, tách khỏi `route` hard:

```json
{"protocol":2,"browser":"chrome.exe","hostname":"example.com","route":"default","mode":"vietnamese","focused":true}
```

- `route`: `default`, `english` hoặc `tsf`; lấy từ rule hard trong
  `storage.local`.
- `mode`: `default`, `vietnamese` hoặc `english`; lấy từ trạng thái hostname
  trong `storage.session`.

Sau khi hotkey V/E được chấp nhận, host gửi event về đúng kết nối browser:

```json
{"protocol":2,"event":"mode-changed","hostname":"example.com","mode":"english"}
```

Host phải gắn event với hostname đang focus tại thời điểm hotkey được nhận để
việc đổi tab ngay sau đó không ghi nhầm website. Extension chỉ ghi event khi
routing đang bật và hostname không bị rule English hard khóa. Ack thông thường
như `{"ok":true}` không làm thay đổi trạng thái đã nhớ.

## Giới hạn đã biết

Extension không thể đọc text đang gõ trong address bar/omnibox thông thường.
Vì vậy rule chỉ có hiệu lực sau navigation hoặc khi tab đã có hostname; không
thể phát hiện `google.com` khi người dùng còn đang gõ trước navigation
([VKey #100](https://github.com/phatMT97/VKey/issues/100)).
