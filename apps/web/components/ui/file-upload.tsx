import * as React from "react"
import { Upload } from "lucide-react"
import { Input } from "./input"
import { Button } from "./button"
import { cn } from "@/lib/utils"

export interface FileUploadProps {
  value?: string // Data URL or file URL
  onChange?: (file: File | null, dataUrl?: string) => void
  accept?: string
  className?: string
  disabled?: boolean
}

const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  ({ value, onChange, accept = "image/*", className, disabled }, ref) => {
    const inputRef = React.useRef<HTMLInputElement>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) {
        onChange?.(null)
        return
      }

      // Convert to data URL
      const reader = new FileReader()
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string
        onChange?.(file, dataUrl)
      }
      reader.readAsDataURL(file)
    }

    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={disabled}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload Logo
        </Button>
        {value && (
          <div className="flex items-center gap-2">
            <img
              src={value}
              alt="Logo preview"
              className="h-10 w-10 rounded object-contain"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.value = ""
                }
                onChange?.(null)
              }}
              disabled={disabled}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

export { FileUpload }

