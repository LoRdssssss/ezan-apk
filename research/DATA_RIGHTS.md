# Veri Hakları (Data Rights)

## 1. Diyanet Namaz Vakitleri Verisi

**İddia:** Diyanet namaz vakitleri verisinin API üzerinden yoğun veya ticari olarak çekilmesi kayıt ve taahhüt gerektirir. 1 yıllık önbelleğe alınma ve kendi barındırmamızdan dağıtılma hakkı yazılı onay gerektirir.
**Durum:** CONFIRMED
**Kaynak / Kanıt:** Diyanet Awqat Salah API İstek ve Taahhüt Formu (<https://awqatsalah.diyanet.gov.tr/files/b8ed95e5-95fc-4635-9c40-406caeeddc1d.pdf>) (Erişim tarihi: 2026-11-01)
**İletişim Kaynağı:** `dinisleriyk@diyanet.gov.tr` adresi ilgili API taahhütname PDF'inin alt bilgisinde belirtilmiştir (Erişim tarihi: 2026-11-01).

### Taahhüt Formu Şartları Özeti ve Mimarimize Etkisi

**Form Şartları Özeti:** Verilen kullanıcı adı ve şifre üçüncü kişilerle paylaşılamaz; sisteme zarar verebilecek isteklerden kaçınılmalıdır.

**Mimarimize Etkisi:** Formdaki "kullanıcı adı ve şifreyi 3. kişilerle paylaşmama" maddesi, ana planımızdaki "sunucu üzerinden 1 yıllık veri çekip kendi barındırmamızdan kullanıcılara dağıtma" mimarisine sorun oluşturabilir. Biz API anahtarımızı değil sadece _veriyi_ dağıtacağız, ancak Diyanet'in bu durumu (verinin yeniden dağıtılmasını) üçüncü kişilerle paylaşım olarak değerlendirip değerlendirmeyeceği belirsizdir. Mimariyi onaylatmak şarttır.

### Diyanet'e Gönderilecek E-posta Taslağı

> Konu: Diyanet Namaz Vakitleri Verisi Kullanım İzni Hakkında
>
> Sayın Yetkili,
>
> Türkiye öncelikli, tamamen ücretsiz ve reklamsız olarak geliştirmekte olduğumuz İslami günlük yardımcı mobil uygulamamız (namaz vakitleri, imsakiye, Kur'an-ı Kerim, kıble) için Diyanet İşleri Başkanlığımızın namaz vakitleri verisini referans almak istiyoruz.
>
> Ürünümüzün kesintisiz çalışabilmesi adına mimarimizi netleştirmeden önce şu üç konuda izninizi rica etmekteyiz:
>
> 1. Reklamsız ve ücretsiz sunulacak bu uygulamada namaz vakitleri verinizi kullanabilir miyiz?
> 2. API üzerinden toplu (örneğin 1 yıllık) veriyi çekip, bunu kendi statik sunucularımız (CDN) üzerinden kullanıcılarımıza dağıtabilir miyiz?
> 3. Kullanıcıların internetsiz ortamlarda da mağdur olmaması adına, bu 1 yıllık vakit verisini kullanıcı cihazında önbellekte tutabilir miyiz?
>
> Bu kullanım senaryoları "3. kişilerle paylaşmama ve sisteme zarar vermeme" taahhüdünüze uygun mudur?
>
> Değerli geri dönüşlerinizi ve yönlendirmenizi arz ederim.
>
> Saygılarımla,
> Sercan

### B Planı Seçenekleri (Diyanet İzni Verilmezse)

Diyanet'ten veriyi kendi sunucumuzdan dağıtma ve 1 yıllık saklama izni alınamazsa:

- **Seçenek A: Cihazda hesaplama + resmi tabloyla doğrulama.** Vakitler (açık kaynaklı/bilinen astronomik formüllerle) cihazda hesaplanır ve sadece sapmaları düzeltmek için (delta tablosu) referans veri kullanılır. Artısı: Veri bağımsızlığı ve %100 internetsiz çalışma. Eksisi: Diyanet'in resmi yöntemine tam olarak ulaşmak zordur, milimetrik doğruluk garantisi zordur; geliştirme maliyeti çok yüksektir.
- **Seçenek B: Uygulamanın doğrudan resmi kaynaktan çekmesi.** Merkezi dağıtım yerine, her mobil uygulama istemcisi Diyanet'in herkese açık servislerinden / API'sinden kendi lokasyonunu sorgular. Artısı: Doğrudan güvenilir resmi veri. Eksisi: Diyanet sunucularına aşırı yük bindirebilir (şartlara aykırı olabilir), uygulama internetsiz kullanılamaz, kullanıcı gizliliği riski oluşur.
