import type { AlignBox, AlignFinding } from './align-page'

export function measureSpacing({
  tokenNames,
  rhythm = false,
}: {
  tokenNames: string[]
  rhythm?: boolean
}): AlignFinding[] {
  const findings: AlignFinding[] = []
  const root = getComputedStyle(document.documentElement)
  const tokens = [
    ...new Set(
      tokenNames
        .map((name) => Number.parseFloat(root.getPropertyValue(name)))
        .filter((value) => Number.isFinite(value) && value > 0),
    ),
  ]
  const round = (value: number) => Math.round(value * 100) / 100
  const boxOf = (node: Element): AlignBox => {
    const rect = node.getBoundingClientRect()
    return { left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom }
  }
  const selectorOf = (node: Element): string => {
    const parts: string[] = []
    let current: Element | null = node
    while (current !== null && current !== document.body) {
      const tag = current.tagName.toLowerCase()
      const siblings = Array.from(current.parentElement?.children ?? []).filter(
        (child) => child.tagName === current?.tagName,
      )
      parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(current) + 1})`)
      current = current.parentElement
    }
    return `body > ${parts.join(' > ')}`
  }
  const visible = (node: Element, inViewport = true) => {
    const box = boxOf(node)
    return (
      node.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      (!inViewport ||
        (box.right > 0 && box.left < innerWidth && box.bottom > 0 && box.top < innerHeight)) &&
      box.right > box.left &&
      box.bottom > box.top
    )
  }
  const contentOf = (row: Element) => {
    const texts: AlignBox[] = []
    const walker = document.createTreeWalker(row, NodeFilter.SHOW_TEXT)
    let node = walker.nextNode()
    while (node !== null) {
      if (
        node.textContent?.trim() &&
        node.parentElement !== null &&
        !node.parentElement.closest('script,style,svg') &&
        visible(node.parentElement, false)
      ) {
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const rect of Array.from(range.getClientRects()))
          if (rect.width > 0 && rect.height > 0) texts.push(rect)
      }
      node = walker.nextNode()
    }
    const icons = Array.from(
      row.querySelectorAll('svg,img,video,input,[role="img"],[data-slot="photo-tile"]'),
    )
      .filter((item) => visible(item, false))
      .map(boxOf)
    const boxes = [...texts, ...icons]
    if (boxes.length === 0) return null
    return {
      left: Math.min(...boxes.map((box) => box.left)),
      right: Math.max(...boxes.map((box) => box.right)),
      texts,
      icons,
    }
  }
  if (rhythm) {
    const quantize = (value: number) => Math.round(value * devicePixelRatio) / devicePixelRatio
    type Measure = {
      row: Element
      box: AlignBox
      actual: number
      guide: AlignFinding['guides'][number]
    }
    const columns = new Map<string, { group: Element; column: string; values: Measure[] }>()
    const add = (
      group: Element,
      kind: string,
      column: string,
      row: Element,
      box: AlignBox,
      axis: 'x' | 'y',
      from: number,
      to: number,
      at: number,
    ) => {
      const key = `${selectorOf(group)}:${kind}:${column}`
      const entry = columns.get(key) ?? { group, column, values: [] }
      entry.values.push({ row, box, actual: quantize(to - from), guide: { axis, from, to, at } })
      columns.set(key, entry)
    }
    const unclipped = (row: Element) => {
      if (!visible(row)) return false
      const box = boxOf(row)
      if (box.top < 0 || box.bottom > innerHeight) return false
      let ancestor = row.parentElement
      while (ancestor !== null) {
        const style = getComputedStyle(ancestor)
        const bounds = boxOf(ancestor)
        if (
          /(auto|scroll|hidden|clip)/.test(style.overflowY) &&
          (box.top < bounds.top || box.bottom > bounds.bottom)
        )
          return false
        ancestor = ancestor.parentElement
      }
      return true
    }
    const trailingOf = (row: Element, texts: AlignBox[]) => {
      const first = texts.toSorted((a, b) => a.left - b.left)[0]
      if (first === undefined) return undefined
      return Array.from(
        row.querySelectorAll('kbd,time,svg,span,[data-slot="badge"],[data-slot="count"]'),
      )
        .filter(
          (item) =>
            visible(item, false) &&
            (item.matches('kbd,time,svg,[data-slot="badge"],[data-slot="count"]') ||
              (item.textContent?.trim() && getComputedStyle(item).flexShrink === '0')),
        )
        .map(boxOf)
        .filter(
          (box) => box.left >= first.right && box.top < first.bottom && box.bottom > first.top,
        )
        .sort((a, b) => b.right - a.right)[0]
    }
    const measureRow = (row: Element, group: Element, kind: string) => {
      const content = contentOf(row)
      if (content === null) return
      const box = boxOf(row)
      const at = (box.top + box.bottom) / 2
      if (row.closest('aside') === null)
        add(group, kind, 'left-inset', row, box, 'y', box.left, content.left, at)
      const trailing = trailingOf(row, content.texts)
      if (trailing !== undefined && row.closest('aside') === null)
        add(group, kind, 'right-inset', row, box, 'y', trailing.right, box.right, at)
      const text = content.texts.toSorted((a, b) => a.top - b.top || a.left - b.left)[0]
      const icon = content.icons.find(
        (item) =>
          text !== undefined &&
          item.right <= text.left &&
          item.top < text.bottom &&
          item.bottom > text.top,
      )
      if (text !== undefined && icon !== undefined)
        add(
          group,
          kind,
          'icon-label-gap',
          row,
          box,
          'y',
          icon.right,
          text.left,
          (text.top + text.bottom) / 2,
        )
    }
    const sidebarRows = new Set<Element>()
    for (const sidebar of Array.from(document.querySelectorAll('aside'))) {
      const rows = Array.from(
        sidebar.querySelectorAll(
          'a,button,[role="menuitem"],[role="row"],[role="listitem"],li,[role="heading"],[role="group"] > span,h1,h2,h3,h4,h5,h6',
        ),
      ).filter(
        (row) =>
          unclipped(row) &&
          !row.parentElement?.closest('a,button,[role="menuitem"]') &&
          (row.matches('a,button,[role="menuitem"]') ||
            row.querySelector('a,button,[role="menuitem"]') === null),
      )
      for (const row of rows) {
        const content = contentOf(row)
        if (content === null) continue
        sidebarRows.add(row)
        const group = row.parentElement?.closest('[role="group"],nav,aside') ?? sidebar
        let kind = 'row'
        if (!row.matches('a,button,[role="menuitem"]')) kind = 'heading'
        else if (!row.textContent?.trim()) kind = 'icon'
        measureRow(row, group, kind)
        if (kind === 'icon') continue
        let band = row
        let ancestor = row.parentElement
        while (ancestor !== null && ancestor !== sidebar) {
          if (boxOf(ancestor).bottom - boxOf(ancestor).top > boxOf(row).bottom - boxOf(row).top + 8)
            break
          band = ancestor
          ancestor = ancestor.parentElement
        }
        const bandBox = boxOf(band)
        const bounds = boxOf(sidebar)
        const at = (boxOf(row).top + boxOf(row).bottom) / 2
        add(
          sidebar,
          'shared',
          'shared-left-edge',
          row,
          boxOf(row),
          'y',
          bounds.left,
          content.left,
          at,
        )
        const bandContent = contentOf(band)
        const trailing = bandContent === null ? undefined : trailingOf(band, bandContent.texts)
        if (trailing !== undefined)
          add(
            sidebar,
            'shared',
            'shared-right-edge',
            row,
            bandBox,
            'y',
            trailing.right,
            bounds.right,
            at,
          )
      }
    }
    const rowSelector = 'a,button,li,[role="row"],[role="listitem"],[role="menuitem"]'
    for (const parent of Array.from(document.querySelectorAll('body *'))) {
      const groups = new Map<string, Element[]>()
      for (const child of Array.from(parent.children)) {
        let row = child
        if (
          !row.matches(rowSelector) &&
          row.childElementCount === 1 &&
          row.firstElementChild?.matches(rowSelector)
        )
          row = row.firstElementChild
        if (!row.matches(rowSelector) || !unclipped(row) || sidebarRows.has(row)) continue
        let shape = row.getAttribute('role')
        if (shape === null) {
          if (row.tagName === 'LI') shape = 'listitem'
          else if (row.tagName === 'A') shape = 'link'
          else shape = row.tagName.toLowerCase()
        }
        const group = groups.get(shape) ?? []
        group.push(row)
        groups.set(shape, group)
      }
      for (const [kind, rows] of groups) {
        if (rows.length < 3) continue
        if (
          rows[0]?.tagName === 'BUTTON' &&
          rows.every((row) => Math.abs(boxOf(row).top - boxOf(rows[0] ?? row).top) <= 1)
        )
          continue
        for (const row of rows) {
          const card = row.querySelector('button,a,[role="button"]') ?? row
          const media = card.querySelector('[data-slot="photo-tile"],img,video')
          if (media === null) {
            measureRow(row, parent, kind)
            continue
          }
          const cardBox = boxOf(card)
          const mediaBox = boxOf(media)
          const mediaAt = (mediaBox.top + mediaBox.bottom) / 2
          add(
            parent,
            `${kind}-media`,
            'media-left-inset',
            media,
            mediaBox,
            'y',
            cardBox.left,
            mediaBox.left,
            mediaAt,
          )
          add(
            parent,
            `${kind}-media`,
            'media-right-inset',
            media,
            mediaBox,
            'y',
            mediaBox.right,
            cardBox.right,
            mediaAt,
          )
          for (const line of Array.from(card.children)) {
            const style = getComputedStyle(line)
            if (
              !style.display.includes('flex') ||
              style.flexDirection !== 'row' ||
              line.querySelector('img,video,[data-slot="photo-tile"]') !== null ||
              !unclipped(line)
            )
              continue
            const content = contentOf(line)
            if (content === null || content.texts.length === 0) continue
            const box = boxOf(line)
            const at = (box.top + box.bottom) / 2
            add(card, 'shared', 'shared-left-edge', line, box, 'y', cardBox.left, content.left, at)
            const trailing = trailingOf(line, content.texts)
            if (trailing !== undefined)
              add(
                card,
                'shared',
                'shared-right-edge',
                line,
                box,
                'y',
                trailing.right,
                cardBox.right,
                at,
              )
          }
          for (const stack of Array.from(card.querySelectorAll('*'))) {
            const style = getComputedStyle(stack)
            if (!style.display.includes('flex') || style.flexDirection !== 'column') continue
            const lines = Array.from(stack.children).filter((line) => visible(line, false))
            if (
              lines.length < 2 ||
              lines.some(
                (line) =>
                  !line.textContent?.trim() ||
                  line.querySelector('img,svg,video,[data-slot="photo-tile"]') !== null,
              )
            )
              continue
            for (const [index, line] of lines.entries()) {
              if (!unclipped(line)) continue
              const lineBox = boxOf(line)
              const content = contentOf(line)
              if (content === null) continue
              const at = (lineBox.top + lineBox.bottom) / 2
              add(
                card,
                'shared',
                'shared-left-edge',
                line,
                lineBox,
                'y',
                cardBox.left,
                content.left,
                at,
              )
              const trailing = trailingOf(line, content.texts)
              if (trailing !== undefined)
                add(
                  card,
                  'shared',
                  'shared-right-edge',
                  line,
                  lineBox,
                  'y',
                  trailing.right,
                  cardBox.right,
                  at,
                )
              add(
                parent,
                `${kind}-card-text`,
                'text-left-inset',
                line,
                lineBox,
                'y',
                cardBox.left,
                content.left,
                at,
              )
              const end = line.childElementCount > 1 ? content.right : lineBox.right
              add(
                parent,
                `${kind}-card-text`,
                'text-right-inset',
                line,
                lineBox,
                'y',
                end,
                cardBox.right,
                at,
              )
              const before = lines[index - 1]
              if (before !== undefined && unclipped(before)) {
                const previous = boxOf(before)
                if (lineBox.top >= previous.bottom)
                  add(
                    parent,
                    `${kind}-card-gap-${index}`,
                    'line-gap',
                    line,
                    lineBox,
                    'x',
                    previous.bottom,
                    lineBox.top,
                    cardBox.right - 28,
                  )
              }
            }
          }
        }
      }
    }
    for (const { group, column, values } of columns.values()) {
      const frequencies = new Map<number, number>()
      for (const value of values)
        frequencies.set(value.actual, (frequencies.get(value.actual) ?? 0) + 1)
      const expected = [...frequencies].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0]
      if (expected === undefined) continue
      const minimum = column.startsWith('shared-') ? 2 : 3
      for (const value of values)
        findings.push({
          check: 'rhythm',
          edge: column,
          a: { selector: selectorOf(value.row), box: value.box },
          b: null,
          delta: values.length < minimum ? 0 : round(Math.abs(value.actual - expected)),
          measurements: {
            actual: value.actual,
            expected: values.length < minimum ? value.actual : expected,
            values: values.map((item) => item.actual),
          },
          rhythm: {
            group: selectorOf(group),
            column,
            onTokenScale: tokens.some((token) => Math.abs(token - expected) < 0.01),
          },
          guides: [value.guide],
        })
    }
    return findings
  }
  const push = (
    edge: string,
    a: Element,
    b: Element,
    actual: number,
    expected: number,
    values: number[],
    axis: 'x' | 'y',
    from: number,
    to: number,
    at: number,
  ) => {
    findings.push({
      check: 'spacing',
      edge,
      a: { selector: selectorOf(a), box: boxOf(a) },
      b: { selector: selectorOf(b), box: boxOf(b) },
      delta: round(Math.abs(actual - expected)),
      measurements: { actual: round(actual), expected: round(expected), values: values.map(round) },
      guides: [{ axis, from, to, at }],
    })
  }
  for (const parent of Array.from(document.querySelectorAll('body *'))) {
    if (parent.closest('[data-align-overlay], [data-align-skeleton]') !== null || !visible(parent))
      continue
    const style = getComputedStyle(parent)
    const children = Array.from(parent.children).filter(
      (child) =>
        visible(child, false) &&
        !(
          child.getAttribute('aria-hidden') === 'true' &&
          child.childNodes.length === 0 &&
          getComputedStyle(child).pointerEvents === 'none'
        ) &&
        !['absolute', 'fixed'].includes(getComputedStyle(child).position),
    )
    const isFlex = style.display === 'flex' || style.display === 'inline-flex'
    const isGrid = style.display === 'grid' || style.display === 'inline-grid'
    if (children.length >= 2 && (isFlex || isGrid)) {
      const vertical = isFlex && style.flexDirection.startsWith('column')
      const ordered = [...children].sort((a, b) => {
        const first = boxOf(a)
        const second = boxOf(b)
        if (vertical) {
          if (Math.abs(first.left - second.left) <= 1) return first.top - second.top
          return first.left - second.left
        }
        if (Math.abs(first.top - second.top) <= 1) return first.left - second.left
        return first.top - second.top
      })
      const pairs = ordered.slice(1).flatMap((b, index) => {
        const a = ordered[index]
        if (a === undefined) return []
        const first = boxOf(a)
        const second = boxOf(b)
        const sameLine = vertical
          ? Math.abs(first.left - second.left) <= 1
          : Math.abs(first.top - second.top) <= 1
        const gap = vertical ? second.top - first.bottom : second.left - first.right
        return sameLine && gap > 0 && visible(a) && visible(b) ? [{ a, b, gap, first, second }] : []
      })
      const shape = (node: Element) =>
        `${node.tagName}:${node.getAttribute('data-slot') ?? ''}:${node.getAttribute('role') ?? ''}`
      for (const pair of pairs) {
        const relatedPairs = pairs.filter(
          (other) => shape(other.a) === shape(pair.a) && shape(other.b) === shape(pair.a),
        )
        const gaps = relatedPairs.map((other) => other.gap).sort((a, b) => a - b)
        const expected = gaps[Math.floor(gaps.length / 2)]
        const from = vertical ? pair.first.bottom : pair.first.right
        const to = vertical ? pair.second.top : pair.second.left
        const at = vertical
          ? (pair.first.left + pair.first.right) / 2
          : (pair.first.top + pair.first.bottom) / 2
        const axis = vertical ? 'x' : 'y'
        if (
          children.filter((child) => shape(child) === shape(pair.a)).length >= 3 &&
          shape(pair.a) === shape(pair.b) &&
          expected !== undefined &&
          Math.abs(pair.gap - expected) > 1
        )
          push('repeated-gap', pair.a, pair.b, pair.gap, expected, gaps, axis, from, to, at)
        const nearest = [...tokens].sort(
          (a, b) => Math.abs(a - pair.gap) - Math.abs(b - pair.gap),
        )[0]
        if (
          nearest !== undefined &&
          Math.abs(pair.gap - nearest) > 0.01 &&
          Math.abs(pair.gap - nearest) <= 1
        )
          push('token-gap', pair.a, pair.b, pair.gap, nearest, [pair.gap], axis, from, to, at)
      }
    }
    const hasSurface =
      style.backgroundColor !== 'rgba(0, 0, 0, 0)' ||
      [
        style.borderLeftWidth,
        style.borderRightWidth,
        style.borderTopWidth,
        style.borderBottomWidth,
      ].some((width) => Number.parseFloat(width) > 0)
    if (
      hasSurface &&
      ((isFlex && !style.flexDirection.startsWith('column') && style.justifyContent === 'center') ||
        ((!isFlex || style.flexDirection.startsWith('column')) && style.textAlign === 'center'))
    ) {
      const bounds = boxOf(parent)
      const boxes = children.map(boxOf)
      for (const node of Array.from(parent.childNodes)) {
        if (!(node instanceof Text) || node.textContent?.trim() === '') continue
        const range = document.createRange()
        range.selectNodeContents(node)
        for (const rect of Array.from(range.getClientRects()))
          if (rect.width > 0 && rect.height > 0)
            boxes.push({ left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom })
      }
      if (boxes.length === 0) continue
      const left =
        Math.min(...boxes.map((box) => box.left)) -
        bounds.left -
        Number.parseFloat(style.borderLeftWidth)
      const right =
        bounds.right -
        Number.parseFloat(style.borderRightWidth) -
        Math.max(...boxes.map((box) => box.right))
      const first = children[0] ?? parent
      if (left >= 0 && right >= 0 && Math.abs(left - right) > 1)
        push(
          'centred-inset',
          first,
          parent,
          left,
          right,
          [left, right],
          'y',
          bounds.left,
          Math.min(...boxes.map((box) => box.left)),
          (bounds.top + bounds.bottom) / 2,
        )
    }
  }
  return findings
}
