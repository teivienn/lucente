import { atoms, useLucente, withLucente } from 'lucente'
import { useRef } from 'react'
import { StatusBar, Text, View } from 'react-native'

const Screen = withLucente(
  View,
  atoms.flex_1,
  atoms.screen,
  atoms.p_lg,
  atoms.gap_lg,
  atoms.md.flex_row,
  atoms.md.px_xl,
)

const Card = withLucente(
  View,
  atoms.card,
  atoms.p_lg,
  atoms.rounded_lg,
  atoms.gap_sm,
  atoms.w_full,
  atoms.md.w_1_2,
)

function Probe() {
  const renders = useRef(0)
  renders.current += 1
  const title = useLucente(atoms.text, atoms.font_semibold, atoms.text_2xl, atoms.md.text_xl)
  const body = useLucente(atoms.muted, atoms.text_md)

  return (
    <Card>
      <Text style={title}>Lucente</Text>
      <Text style={body}>{`Probe renders: ${renders.current}`}</Text>
      <Text style={body}>
        Resize the window past 768. This card follows the breakpoint. The screen that rendered it does not.
      </Text>
    </Card>
  )
}

export function Demo() {
  const renders = useRef(0)
  renders.current += 1

  return (
    <Screen>
      <StatusBar barStyle="light-content" />
      <Probe />
      <Card>
        <Text style={[atoms.text, atoms.font_medium, atoms.text_md]}>{`App renders: ${renders.current}`}</Text>
        <Text style={[atoms.muted, atoms.text_sm]}>
          withLucente subscribes inside the card, so this number stays put when the breakpoint changes.
        </Text>
      </Card>
      <View style={[atoms.card, atoms.p_md, atoms.rounded_md, atoms.w_full]}>
        <Text style={[atoms.text, atoms.text_sm]}>Static atoms. No hook on this row.</Text>
      </View>
    </Screen>
  )
}
