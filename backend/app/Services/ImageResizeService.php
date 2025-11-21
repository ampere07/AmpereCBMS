<?php

namespace App\Services;

use App\Models\ImageSizeSetting;
use Illuminate\Support\Facades\Log;

class ImageResizeService
{
    public static function resizeImage($sourcePath, $destinationPath)
    {
        $setting = ImageSizeSetting::getActiveSetting();
        
        Log::info('=== IMAGE RESIZE SERVICE CALLED ===', [
            'source' => $sourcePath,
            'destination' => $destinationPath,
            'active_settings_found' => $setting ? 'YES' : 'NO',
            'max_width' => $setting ? $setting->max_width : 'N/A',
            'max_height' => $setting ? $setting->max_height : 'N/A',
            'quality' => $setting ? $setting->quality : 'N/A'
        ]);
        
        if (!$setting) {
            Log::warning('No active image size setting found. Skipping resize.');
            return false;
        }

        $imageInfo = getimagesize($sourcePath);
        if (!$imageInfo) {
            Log::error('Unable to get image info for: ' . $sourcePath);
            return false;
        }

        list($originalWidth, $originalHeight, $imageType) = $imageInfo;
        
        Log::info('Original image dimensions', [
            'width' => $originalWidth,
            'height' => $originalHeight,
            'type' => $imageType
        ]);

        if ($originalWidth <= $setting->max_width && $originalHeight <= $setting->max_height) {
            Log::info('Image already within size limits, copying without resize');
            copy($sourcePath, $destinationPath);
            return true;
        }

        $ratio = min($setting->max_width / $originalWidth, $setting->max_height / $originalHeight);
        $newWidth = round($originalWidth * $ratio);
        $newHeight = round($originalHeight * $ratio);
        
        Log::info('Resizing image', [
            'new_width' => $newWidth,
            'new_height' => $newHeight,
            'ratio' => $ratio
        ]);

        $sourceImage = self::createImageFromType($sourcePath, $imageType);
        if (!$sourceImage) {
            Log::error('Failed to create image resource for: ' . $sourcePath);
            return false;
        }

        $resizedImage = imagecreatetruecolor($newWidth, $newHeight);

        if ($imageType === IMAGETYPE_PNG) {
            imagealphablending($resizedImage, false);
            imagesavealpha($resizedImage, true);
            $transparent = imagecolorallocatealpha($resizedImage, 255, 255, 255, 127);
            imagefilledrectangle($resizedImage, 0, 0, $newWidth, $newHeight, $transparent);
        }

        imagecopyresampled(
            $resizedImage,
            $sourceImage,
            0, 0, 0, 0,
            $newWidth,
            $newHeight,
            $originalWidth,
            $originalHeight
        );

        $result = self::saveImageByType($resizedImage, $destinationPath, $imageType, $setting->quality);
        
        Log::info('Image resize completed', [
            'success' => $result,
            'destination' => $destinationPath
        ]);

        imagedestroy($sourceImage);
        imagedestroy($resizedImage);

        return $result;
    }

    private static function createImageFromType($path, $imageType)
    {
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                return imagecreatefromjpeg($path);
            case IMAGETYPE_PNG:
                return imagecreatefrompng($path);
            case IMAGETYPE_GIF:
                return imagecreatefromgif($path);
            case IMAGETYPE_WEBP:
                return imagecreatefromwebp($path);
            default:
                return false;
        }
    }

    private static function saveImageByType($image, $path, $imageType, $quality)
    {
        switch ($imageType) {
            case IMAGETYPE_JPEG:
                return imagejpeg($image, $path, $quality);
            case IMAGETYPE_PNG:
                $pngQuality = round((100 - $quality) / 10);
                return imagepng($image, $path, $pngQuality);
            case IMAGETYPE_GIF:
                return imagegif($image, $path);
            case IMAGETYPE_WEBP:
                return imagewebp($image, $path, $quality);
            default:
                return false;
        }
    }

    public static function isImageFile($mimeType)
    {
        return in_array($mimeType, [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'image/webp'
        ]);
    }
}
