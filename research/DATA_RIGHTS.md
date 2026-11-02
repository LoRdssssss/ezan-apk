# Veri Hakları (Data Rights)

## Güncel karar (01_PLAN_CHANGES madde 11)
Cihazda hesaplama birincil yöntemdir; Diyanet tabloları yalnız test referansı olarak kullanılır.

## 1. Diyanet Namaz Vakitleri Verisi

**İddia:** Diyanet namaz vakitleri verisinin API üzerinden yoğun veya ticari olarak çekilmesi kayıt ve taahhüt gerektirir. 1 yıllık önbelleğe alınma ve kendi barındırmamızdan dağıtılma hakkı yazılı onay gerektirir.
**Durum:** HYPOTHESIS
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
> 1. Uygulamamızda vakitleri açık kaynaklı astronomik formüllerle cihazda hesaplamaktayız. Bu vakitleri "Diyanet yöntemine göre" diye tanıtmamız uygun mudur?
> 2. Kamuya açık yayınladığınız PDF/Excel vakit tablolarını yalnız kendi iç doğruluk testimiz için saklamamız ve açık kaynak kod depomuzda (referans veri olarak) tutmamız uygun mudur?
> 3. İleride resmi verinizi (cihazda hesaplama yerine) doğrudan kullanarak 1 yıllık çevrimdışı önbellek sunmak istersek, bunun için izlememiz gereken izin yolu nedir?
>
> Değerli geri dönüşlerinizi ve yönlendirmenizi arz ederim.
>
> Saygılarımla,
> Sercan

### B Planı Seçenekleri (Diyanet İzni Verilmezse)

Diyanet'ten veriyi kendi sunucumuzdan dağıtma ve 1 yıllık saklama izni alınamazsa:

- **Seçenek A: Cihazda hesaplama + resmi tabloyla doğrulama.** Vakitler (açık kaynaklı/bilinen astronomik formüllerle) cihazda hesaplanır ve sadece sapmaları düzeltmek için (delta tablosu) referans veri kullanılır. Artısı: Veri bağımsızlığı ve %100 internetsiz çalışma. PR #13 ölçümlerine göre Türkiye için MAE (Ortalama Mutlak Hata) 0,35 dakika, maksimum sapma ise 2 dakikadır.
- **Seçenek B: Uygulamanın doğrudan resmi kaynaktan çekmesi.** Merkezi dağıtım yerine, her mobil uygulama istemcisi Diyanet'in herkese açık servislerinden / API'sinden kendi lokasyonunu sorgular. Artısı: Doğrudan güvenilir resmi veri. Eksisi: Diyanet sunucularına aşırı yük bindirebilir (şartlara aykırı olabilir), uygulama internetsiz kullanılamaz, kullanıcı gizliliği riski oluşur.
