# Araştırma ve belge araçları

Yorum toplama ve bildirim kaydedici araçları kendi görevlerinde eklenecektir.
Rakiplerin özel sunucularına erişen veya dosyalarını inceleyen araç eklenmez.

`check-links.sh`, Git tarafından izlenen tüm Markdown dosyalarını denetler.
Depo kökünde `npm ci` ardından `npm run check:links` çalıştırın.
Yeni belgeyi denetimden önce `git add <dosya>` ile izlemeye alın.
Bağlantı kontrolü hatalı dosya / HTTP yanıtında sıfırdan farklı kod döndürür.
