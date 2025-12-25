"use client"

import { useEffect, useState } from "react"

interface Tag {
  id: string
  name: string
  category: string
  icon: string | null
  color: string | null
}

interface TagSelectorProps {
  selectedTags: string[]
  onTagsChange: (tagIds: string[]) => void
  multiSelect?: boolean
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  multiSelect = true,
}: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => {
        setTags(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching tags:", error)
        setLoading(false)
      })
  }, [])

  const handleTagClick = (tagId: string) => {
    if (multiSelect) {
      if (selectedTags.includes(tagId)) {
        onTagsChange(selectedTags.filter((id) => id !== tagId))
      } else {
        onTagsChange([...selectedTags, tagId])
      }
    } else {
      onTagsChange(selectedTags.includes(tagId) ? [] : [tagId])
    }
  }

  const tagsByCategory = tags.reduce((acc, tag) => {
    if (!acc[tag.category]) {
      acc[tag.category] = []
    }
    acc[tag.category].push(tag)
    return acc
  }, {} as Record<string, Tag[]>)

  if (loading) {
    return <div className="p-4 text-center">Loading tags...</div>
  }

  return (
    <div className="max-h-96 overflow-y-auto p-4">
      {Object.entries(tagsByCategory).map(([category, categoryTags]) => (
        <div key={category} className="mb-4">
          <h3 className="mb-2 text-sm font-semibold uppercase text-gray-500">
            {category}
          </h3>
          <div className="flex flex-wrap gap-2">
            {categoryTags.map((tag) => {
              const isSelected = selectedTags.includes(tag.id)
              return (
                <button
                  key={tag.id}
                  onClick={() => handleTagClick(tag.id)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "ring-2 ring-offset-2"
                      : "opacity-70 hover:opacity-100"
                  }`}
                  style={{
                    backgroundColor: isSelected
                      ? tag.color || "#8B5CF6"
                      : `${tag.color || "#8B5CF6"}20`,
                    color: isSelected ? "white" : tag.color || "#8B5CF6",
                    ringColor: tag.color || "#8B5CF6",
                  }}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  <span>{tag.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}




