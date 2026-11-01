# Windows test laboratuvarı kurulumu

## Kapsam ve doğrulama durumu

Bu kılavuz Windows 10/11 üzerinde PowerShell, veri aktarabilen USB kablosu,
Xiaomi / Redmi ve Samsung Android telefonları içindir. iOS derleme / cihaz
otomasyonu ayrıca macOS / Xcode gerektirir. Emülatör, alarm güvenilirliği
kabul testinde gerçek cihaz yerine geçmez.

`CONFIRMED`: Bu PR hazırlanırken resmi Maestro README'sindeki Java 17+
gereksinimi, resmi sürüm arşivi / SHA-256 dosyası ve scrcpy Windows
kurulum belgeleri okundu. Aşağıdaki Windows kurulumları ve telefon işlemleri
bu Linux bulut ortamında çalıştırılmadı; cihaz sonuçları `UNKNOWN` durumundadır.
Her “beklenen çıktı” bir kabul ölçütüdür, alınmış test sonucu değildir.
Menü adları üretici / Android sürümüne göre değişebilir.

## 1. Java 21

Resmi indirme: [Microsoft Build of OpenJDK](https://learn.microsoft.com/java/openjdk/download).
Maestro en az Java 17 ister; bu kılavuz Java 21 kullanır.

PowerShell'de WinGet varsa:

```powershell
winget --version
winget install --exact --id Microsoft.OpenJDK.21
```

WinGet yoksa resmi sayfadan Windows mimarinize uygun JDK yükleyicisini
indirin; PATH ve JAVA_HOME seçeneklerini etkinleştirin. Terminali yeniden açın.

```powershell
java -version
java -XshowSettings:properties -version
Get-Command java
```

Beklenen: Java sürümü `21...`, özelliklerde geçerli bir `java.home` yolu ve
`Get-Command` çıktısında çalıştırılabilir Java. `JAVA_HOME` gerekiyorsa
Windows “Kullanıcı ortam değişkenleri” ekranında bu JDK kökünü seçin
(`bin` klasörünü değil); PATH'e `%JAVA_HOME%\bin` ekleyin.
Eski Java görünüyorsa önce PATH sırasını düzeltin.

## 2. Android SDK platform-tools / ADB

Resmi kaynaklar:

- [Android SDK platform-tools](https://developer.android.com/tools/releases/platform-tools)
- [Windows ZIP indirme](https://dl.google.com/android/repository/platform-tools-latest-windows.zip)
- [ADB belgeleri](https://developer.android.com/tools/adb)
- [Geliştirici seçenekleri](https://developer.android.com/studio/debug/dev-options)
- [Windows OEM USB sürücüleri](https://developer.android.com/studio/run/oem-usb)

ZIP'i örneğin `C:\Android\platform-tools` dizinine çıkarın. Yayıncı tarafından
sağlanan lisans / indirme koşullarını okuyun. Resmi kaynak dışında ADB veya
USB sürücüsü indirmeyin. Bu terminal için PATH:

```powershell
$env:Path = "C:\Android\platform-tools;$env:Path"
adb version
where.exe adb
```

Beklenen: `Android Debug Bridge version 1.0.41` benzeri sürüm bilgisi ve
`Installed as ...\adb.exe`. Tam paket sürümü zamanla değişebilir.
`where.exe adb` birden çok kopya gösterirse araçları aynı platform-tools
sürümüne yönlendirin. Kalıcı kullanım için Windows kullanıcı PATH'ine
`C:\Android\platform-tools` ekleyip yeni terminal açın.

## 3. Telefonda geliştirici seçenekleri

### Xiaomi / Redmi (MIUI / HyperOS)

1. Ayarlar → Telefon hakkında → MIUI / HyperOS sürümüne yedi kez dokunun.
   İstenirse cihaz ekran kilidini cihaz üzerinde girin.
2. Ayarlar → Ek ayarlar → Geliştirici seçenekleri → USB hata ayıklama açın.
3. USB ile bağlayın, telefonu açık ve kilidi çözülmüş tutun. Gerekirse USB
   kullanımını “Dosya aktarımı” olarak seçin.
4. Telefonda RSA istemini kontrol edip yalnızca kendi test bilgisayarınıza
   izin verin. İstem yoksa kablo / port ve resmi USB sürücüsünü kontrol edin.
5. scrcpy görüntü verip dokunmaları iletemiyorsa, resmi scrcpy belgesindeki
   ayrı “USB hata ayıklama (Güvenlik ayarları)” seçeneğini kontrol edin.
   Model destekliyorsa etkinleştirip yeniden başlatın. Hesap / üretici
   kısıtı varsa aşmayın; elle gözlem yapıp otomasyon kısıtını kaydedin.

### Samsung (One UI)

1. Ayarlar → Telefon hakkında → Yazılım bilgileri → Yapım numarasına
   yedi kez dokunun; istenirse cihaz ekran kilidini cihazda girin.
2. Ayarlar → Geliştirici seçenekleri → USB hata ayıklama açın.
3. USB veri kablosuyla bağlayın; kilidi açın ve RSA istemini onaylayın.
4. Görünmüyorsa Aygıt Yöneticisi ve resmi
   [Samsung USB sürücüsünü](https://developer.samsung.com/android-usb-driver) kontrol edin.
   Kurumsal yönetim veya Otomatik Engelleyici USB komutlarını engelliyorsa
   cihazdaki açıklamayı inceleyin; yetkiniz yoksa testi durdurup kısıtı kaydedin.

### Ortak ADB doğrulaması

```powershell
adb start-server
adb devices -l
```

Beklenen: `List of devices attached` altında her test telefonu `device`
durumunda görünür. `unauthorized` telefon onayı eksikliğini, `offline`
bağlantı sorununu gösterir; ikisi de başarı değildir. Boş liste de başarı
sayılmaz. Kablo / sürücü düzeldikten sonra gerekirse yalnızca kendi yerel
ADB sunucunuzu `adb kill-server` ve `adb start-server` ile yeniden başlatın.

Tek telefonu açıkça seçin; örnekteki seri numarasını gerçek cihazınızla
değiştirin. Seri numarasını depoya veya herkese açık rapora koymayın.

```powershell
$serial = 'CIHAZ_SERI_NO'
adb -s $serial get-state
adb -s $serial shell getprop ro.product.model
adb -s $serial shell getprop ro.build.version.release
```

Beklenen: `device`, gerçek model adı ve Android sürümü. Xiaomi ve Samsung
için ayrı tekrarlayın. Plan değişikliklerindeki alarm kabul testi en az
üç gerçek cihaz gerektirir; iki cihazlık lab kontrolü bu kabulün yerine geçmez.

## 4. scrcpy

Resmi [Windows kurulum belgesi](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md)
ve [sürümler / indirme](https://github.com/Genymobile/scrcpy/releases/latest).
WinGet kullanımı resmi belgede desteklenir:

```powershell
winget install --exact --id Genymobile.scrcpy
```

Alternatif: Resmi sürüm ZIP'ini açın, o sürümün yayımlanmış SHA-256 değerini
`Get-FileHash <zip-yolu> -Algorithm SHA256` ile karşılaştırın ve çıkarılan
dizini kullanıcı PATH'ine ekleyin. Uyuşmazsa arşivi kullanmayın.
Yeni terminalde:

```powershell
scrcpy --version
where.exe adb
scrcpy --serial $serial --no-audio
```

Beklenen: scrcpy sürümü, ardından seçilen telefonun canlı ekranı ve izin
veriliyorsa fareyle kontrol. Sadece sürüm çıktısı cihaz doğrulaması değildir.
Pencereyi kapatınca oturum biter. Kayıt örneği, depo kökünden:

```powershell
New-Item -ItemType Directory -Force research\evidence\lab | Out-Null
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
scrcpy --serial $serial --no-audio --record "research\evidence\lab\$stamp-screen.mp4"
```

Beklenen: oturum kapandıktan sonra açılabilen video dosyası. `--no-audio`
nedeniyle bu kayıt ezan sesinin duyulduğuna kanıt değildir. Ses ölçümü ayrı
protokolle yapılır. Kişisel bildirimleri / hesapları içeren kayıtları eklemeyin.

## 5. Maestro CLI (Windows)

Resmi [kurulum belgesi](https://docs.maestro.dev/maestro-cli/how-to-install-maestro-cli),
[README / Java gereksinimi](https://github.com/mobile-dev-inc/maestro#getting-started)
ve [CLI sürümleri](https://github.com/mobile-dev-inc/maestro/releases).

Windows'ta resmi `maestro.zip` dağıtımını kullanın. Aşağıdaki sürüm örneği
inceleme sırasında erişilen `cli-2.12.0` sürümüdür. Başka sürüme geçerken
ZIP ile checksum dosyasını aynı resmi sürümden alın.

```powershell
$release = 'cli-2.12.0'
$base = "https://github.com/mobile-dev-inc/maestro/releases/download/$release"
$downloadDir = Join-Path $env:TEMP "ezan-maestro-$release"
New-Item -ItemType Directory -Force $downloadDir | Out-Null
Invoke-WebRequest "$base/maestro.zip" -OutFile "$downloadDir\maestro.zip"
Invoke-WebRequest "$base/checksums_sha256.txt" -OutFile "$downloadDir\checksums_sha256.txt"
$lines = @(Get-Content "$downloadDir\checksums_sha256.txt" | Where-Object { $_ -match '\s+\*?maestro\.zip$' })
if ($lines.Count -ne 1) { throw 'Tek bir maestro.zip checksum kaydı bulunamadı' }
$expected = ($lines[0] -split '\s+')[0]
$actual = (Get-FileHash "$downloadDir\maestro.zip" -Algorithm SHA256).Hash
if ($expected -notmatch '^[0-9a-fA-F]{64}$' -or $actual -ne $expected) { throw 'SHA-256 uyuşmuyor' }
$installDir = "C:\Tools\Maestro\$release"
if (Test-Path $installDir) { throw 'Hedef dizin zaten var; mevcut kurulumu kontrol edin' }
Expand-Archive "$downloadDir\maestro.zip" -DestinationPath $installDir
$launchers = @(Get-ChildItem $installDir -Recurse -Filter maestro.bat)
if ($launchers.Count -ne 1) { throw 'Maestro Windows başlatıcısını kontrol edin' }
$maestroBin = $launchers[0].DirectoryName
$env:Path = "$maestroBin;$env:Path"
maestro --version
```

Beklenen: indirme ve checksum adımları hatasız tamamlanır, son komut seçilen
sürümü (`2.12.0`) yazar. Sertifika veya checksum hatasını devre dışı
bırakmayın. `$maestroBin` dizinini kalıcı kullanıcı PATH'ine ekleyin.
Yeni terminalde `java -version`, `adb devices -l`, `maestro --version`
komutlarını tekrar doğrulayın.

PowerShell ve WSL ADB kurulumlarını bu yol üzerinde karıştırmayın.
WSL seçilirse USB aktarımı ve WSL içindeki Java / ADB ayrıca kurulmalı ve
o terminalden telefonun `device` olduğu doğrulanmalıdır; bu kılavuzun
varsayılanı yerel Windows kurulumudur.

### Zararsız cihaz akışı

Depo kökünde, önce Ayarlar uygulamasını elle açıp başlığın cihaz dilinde
`Ayarlar` veya `Settings` olduğunu doğrulayın. Farklıysa aşağıdaki ifadeyi
gerçekte gördüğünüz metne göre değiştirin. Geçici akış:

```powershell
$flow = Join-Path $env:TEMP 'ezan-lab-smoke.yaml'
@'
appId: com.android.settings
---
- launchApp
- assertVisible: "Ayarlar|Settings"
'@ | Set-Content -Encoding utf8 $flow
maestro --device $serial test $flow
```

Beklenen: seçili telefonun Ayarlar ekranı açılır, `launchApp` ve `assertVisible`
adımları geçer ve süreç çıkış kodu 0 olur. `$LASTEXITCODE` ile kontrol edin.
Yanlış dil / görünür metin, cihaz seçimi, Java veya izin hatasında test
başarısızdır; başarılı diye raporlamayın. Bu akış alarmı veya rakip uygulamayı
doğrulamaz. Rakiplerde yalnızca normal kullanıcı arayüzü işlemleri yapılır.

## 6. UI hiyerarşisi ve kanıt

Telefonda kişisel veri içermeyen test ekranını açın. Depo kökünde:

```powershell
adb -s $serial shell uiautomator dump /sdcard/ezan-lab-ui.xml
adb -s $serial pull /sdcard/ezan-lab-ui.xml research\evidence\lab\ui.xml
adb -s $serial shell rm /sdcard/ezan-lab-ui.xml
Get-Item research\evidence\lab\ui.xml
```

Beklenen: `UI hierarchy dumped to ...`, başarılı aktarım ve boş olmayan XML.
XML'i açıp hedef ekranla eşleştiğini doğrulayın. Kişisel veri varsa rapora
koymayın. Bu işlem uygulama kodunu veya APK dosyalarını incelemez.

## 7. Laboratuvar kabul kaydı

Her gerçek koşuda tarih / saat dilimi, model, işletim sistemi, araç sürümleri,
komut, çıkış kodu, gözlenen sonuç ve kişisel veriden arındırılmış kanıt
yolunu kaydedin. Komutları her telefon için ayrı çalıştırın.

| Kontrol | Beklenen | Bu bulut oturumundaki durum |
| --- | --- | --- |
| Java | 21 sürümü, doğru PATH | Windows: UNKNOWN / çalıştırılmadı |
| ADB | Xiaomi ve Samsung `device` | UNKNOWN / telefon bağlı değil |
| scrcpy | Canlı kontrol, açılabilen kayıt | UNKNOWN / çalıştırılmadı |
| Maestro | Sürüm + cihaz akışı geçiyor | UNKNOWN / çalıştırılmadı |
| UI Automator | Hedef ekranın dolu XML'i | UNKNOWN / çalıştırılmadı |

Bildirim Kaydedici bu issue'nun kapsamı dışındadır; henüz test uygulaması
yoktur. Alarm / ses ölçümü, yeniden başlatma, izin iptali ve Rahatsız Etmeyin
senaryoları [plan değişikliklerine](01_PLAN_CHANGES.md) göre ayrı görevlerde
uygulanır. Pil kısıtlarını ölçüm öncesi sessizce değiştirmeyin; varsayılan ve
kullanıcı tarafından değiştirilmiş durumları ayrı kaydedin.

İş bitince kaydı durdurun, geçici dosyaları temizleyin ve telefonda test
bilgisayarının USB hata ayıklama yetkisini kaldırın. Test için açılan ek
güvenlik seçeneklerini önceki durumuna döndürün.
