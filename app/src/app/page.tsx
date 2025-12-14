'use client';

import { FormEvent, useMemo, useState } from 'react';

type Status =
  | 'Occupied'
  | 'Vacant Clean'
  | 'Vacant Dirty'
  | 'Do Not Disturb'
  | 'Sleep Out'
  | 'Out of Order';

type Room = {
  number: string;
  status: Status;
  occupancy: number | null;
  notes: string;
};

type ExtraRequest = {
  type: string;
  room: string;
};

const statusOptions: Array<{ value: Status; label: string; short: string }> = [
  { value: 'Occupied', label: 'Occupied', short: 'occ' },
  { value: 'Vacant Clean', label: 'Vacant Clean', short: 'VC' },
  { value: 'Vacant Dirty', label: 'Vacant Dirty', short: 'VD' },
  { value: 'Do Not Disturb', label: 'Do Not Disturb', short: 'DND' },
  { value: 'Sleep Out', label: 'Sleep Out', short: 'S/O' },
  { value: 'Out of Order', label: 'Out of Order', short: 'OOO' },
];

const initialRooms: Room[] = [
  { number: '101', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '102', status: 'Vacant Clean', occupancy: null, notes: '' },
  { number: '103', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '104', status: 'Occupied', occupancy: 4, notes: '' },
  { number: '105', status: 'Vacant Clean', occupancy: null, notes: '' },
  { number: '106', status: 'Occupied', occupancy: 4, notes: '' },
  { number: '107', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '108', status: 'Do Not Disturb', occupancy: null, notes: '' },
  { number: '109', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '201', status: 'Sleep Out', occupancy: null, notes: '' },
  { number: '202', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '203', status: 'Vacant Dirty', occupancy: null, notes: '' },
  { number: '204', status: 'Occupied', occupancy: 4, notes: '' },
  { number: '205', status: 'Occupied', occupancy: 1, notes: '' },
  { number: '206', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '207', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '208', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '209', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '301', status: 'Occupied', occupancy: 3, notes: '' },
  { number: '302', status: 'Occupied', occupancy: 1, notes: '' },
  { number: '303', status: 'Occupied', occupancy: 1, notes: '' },
  { number: '304', status: 'Occupied', occupancy: 4, notes: '' },
  { number: '305', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '306', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '307', status: 'Do Not Disturb', occupancy: null, notes: '' },
  { number: '308', status: 'Occupied', occupancy: 2, notes: '' },
  { number: '309', status: 'Occupied', occupancy: 2, notes: '' },
];

const initialExtras: ExtraRequest[] = [
  { type: 'Baby Cot', room: '301' },
  { type: 'Extra Bed', room: '304' },
];

function formatRenderDate(value: string) {
  if (!value) {
    return '';
  }
  const months = [
    'Jan.',
    'Feb.',
    'Mar.',
    'Apr.',
    'May',
    'Jun.',
    'Jul.',
    'Aug.',
    'Sep.',
    'Oct.',
    'Nov.',
    'Dec.',
  ];
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${months[date.getMonth()]} ${date.getDate()},${date.getFullYear()}`;
}

function formatRoomStatus(room: Room) {
  const option = statusOptions.find((item) => item.value === room.status);
  if (!option) {
    return room.status;
  }

  if (room.status === 'Occupied') {
    const guests = room.occupancy && room.occupancy > 0 ? room.occupancy : 1;
    return `${option.short} ${guests}`;
  }

  return option.short;
}

function getFloorFromRoom(roomNumber: string) {
  return roomNumber.charAt(0);
}

export default function Home() {
  const [shift, setShift] = useState('Morning');
  const [date, setDate] = useState('2025-12-14');
  const [attendant, setAttendant] = useState('Sai');
  const [rooms, setRooms] = useState<Room[]>(initialRooms);
  const [extras, setExtras] = useState<ExtraRequest[]>(initialExtras);
  const [selectedFloor, setSelectedFloor] = useState<string>('All');
  const [copied, setCopied] = useState(false);
  const [newExtraType, setNewExtraType] = useState('Baby Cot');
  const [newExtraRoom, setNewExtraRoom] = useState('');

  const floors = useMemo(() => {
    const unique = new Set(rooms.map((room) => getFloorFromRoom(room.number)));
    return ['All', ...Array.from(unique).sort()];
  }, [rooms]);

  const filteredRooms = useMemo(() => {
    if (selectedFloor === 'All') {
      return rooms.slice().sort((a, b) => Number(a.number) - Number(b.number));
    }
    return rooms
      .filter((room) => getFloorFromRoom(room.number) === selectedFloor)
      .sort((a, b) => Number(a.number) - Number(b.number));
  }, [rooms, selectedFloor]);

  const stats = useMemo(() => {
    const totalGuests = rooms.reduce((acc, room) => {
      if (room.status === 'Occupied') {
        return acc + (room.occupancy ?? 1);
      }
      return acc;
    }, 0);
    const occupiedRooms = rooms.filter((room) => room.status === 'Occupied').length;
    const vacantCleanRooms = rooms.filter((room) => room.status === 'Vacant Clean').length;
    const vacantDirtyRooms = rooms.filter((room) => room.status === 'Vacant Dirty').length;
    const dndRooms = rooms.filter((room) => room.status === 'Do Not Disturb').length;

    return {
      totalRooms: rooms.length,
      occupiedRooms,
      totalGuests,
      vacantCleanRooms,
      vacantDirtyRooms,
      dndRooms,
    };
  }, [rooms]);

  const message = useMemo(() => {
    const header = `Occupancy - ${shift} Date : ${formatRenderDate(date)} Attendant : ${
      attendant.trim() || '—'
    }`;

    const roomLine = rooms
      .slice()
      .sort((a, b) => Number(a.number) - Number(b.number))
      .map((room) => {
        const status = formatRoomStatus(room);
        const note = room.notes.trim();
        return note ? `${room.number}- ${status} (${note})` : `${room.number}- ${status}`;
      })
      .join(' ');

    const extrasLine = extras.length
      ? extras.map((item) => `${item.type}:${item.room}`).join(' ')
      : '';

    return [header, roomLine, extrasLine].filter(Boolean).join(' ');
  }, [attendant, date, extras, rooms, shift]);

  const whatsappLink = useMemo(() => {
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }, [message]);

  const handleRoomStatusChange = (roomNumber: string, status: Status) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.number !== roomNumber) {
          return room;
        }
        return {
          ...room,
          status,
          occupancy: status === 'Occupied' ? room.occupancy ?? 1 : null,
        };
      })
    );
  };

  const handleOccupancyChange = (roomNumber: string, occupancy: number) => {
    setRooms((prev) =>
      prev.map((room) => {
        if (room.number !== roomNumber) {
          return room;
        }
        return {
          ...room,
          occupancy: Math.max(1, Math.min(6, occupancy || 1)),
        };
      })
    );
  };

  const handleNotesChange = (roomNumber: string, notes: string) => {
    setRooms((prev) =>
      prev.map((room) => (room.number === roomNumber ? { ...room, notes } : room))
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Clipboard copy failed', error);
    }
  };

  const handleAddExtra = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const room = newExtraRoom.trim();
    if (!room) {
      return;
    }
    setExtras((prev) => [...prev, { type: newExtraType, room }]);
    setNewExtraRoom('');
  };

  const handleRemoveExtra = (index: number) => {
    setExtras((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleReset = () => {
    setShift('Morning');
    setDate('2025-12-14');
    setAttendant('Sai');
    setRooms(initialRooms);
    setExtras(initialExtras);
    setSelectedFloor('All');
  };

  return (
    <div className="min-h-screen bg-slate-950/5 pb-16 pt-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4">
        <header className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-lg">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Daily Housekeeping Discrepancy</h1>
              <p className="text-sm text-slate-500">Capture occupancy and generate a WhatsApp-ready summary in seconds.</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:text-slate-800"
            >
              Reset to Template
            </button>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Shift
              <select
                value={shift}
                onChange={(event) => setShift(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Date
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              Attendant
              <input
                type="text"
                value={attendant}
                onChange={(event) => setAttendant(event.target.value)}
                placeholder="Name"
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
              />
            </label>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-5">
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">Rooms</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.totalRooms}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">Occupied</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.occupiedRooms}</p>
            <p className="text-xs text-slate-500">{stats.totalGuests} guests</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">Vacant Clean</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.vacantCleanRooms}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">Vacant Dirty</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.vacantDirtyRooms}</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur">
            <p className="text-xs uppercase tracking-wide text-slate-400">DND</p>
            <p className="text-2xl font-semibold text-slate-900">{stats.dndRooms}</p>
            <p className="text-xs text-slate-500">+ {extras.length} special requests</p>
          </div>
        </section>

        <section className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            {floors.map((floor) => (
              <button
                key={floor}
                type="button"
                onClick={() => setSelectedFloor(floor)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  selectedFloor === floor
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }`}
              >
                {floor === 'All' ? 'All Floors' : `Level ${floor}`}
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredRooms.map((room) => (
              <div
                key={room.number}
                className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-semibold text-slate-900">{room.number}</p>
                    <p className="text-xs uppercase text-slate-400">Level {getFloorFromRoom(room.number)}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-600">
                    {formatRoomStatus(room)}
                  </div>
                </div>
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Status
                  <select
                    value={room.status}
                    onChange={(event) => handleRoomStatusChange(room.number, event.target.value as Status)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                {room.status === 'Occupied' && (
                  <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                    Guests in room
                    <input
                      type="number"
                      min={1}
                      max={6}
                      value={room.occupancy ?? 1}
                      onChange={(event) => handleOccupancyChange(room.number, Number(event.target.value))}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                    />
                  </label>
                )}
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                  Notes
                  <textarea
                    value={room.notes}
                    onChange={(event) => handleNotesChange(room.number, event.target.value)}
                    placeholder="Optional remarks"
                    rows={2}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                  />
                </label>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Special Requests</h2>
                <p className="text-xs text-slate-500">Track baby cots, extra beds, rollaways, and more.</p>
              </div>
            </div>

            <ul className="flex flex-col gap-2">
              {extras.map((extra, index) => (
                <li
                  key={`${extra.type}-${extra.room}-${index}`}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700"
                >
                  <span className="font-medium text-slate-900">{extra.type}</span>
                  <span className="flex-1 text-right font-semibold text-slate-600">Room {extra.room}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveExtra(index)}
                    className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-500 transition hover:text-rose-500"
                  >
                    Remove
                  </button>
                </li>
              ))}
              {extras.length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-400">
                  No extra items recorded yet.
                </li>
              )}
            </ul>

            <form onSubmit={handleAddExtra} className="grid gap-3 rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-4">
              <h3 className="text-sm font-semibold text-slate-900">Add Request</h3>
              <label className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                Type
                <select
                  value={newExtraType}
                  onChange={(event) => setNewExtraType(event.target.value)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                >
                  <option value="Baby Cot">Baby Cot</option>
                  <option value="Extra Bed">Extra Bed</option>
                  <option value="Rollaway">Rollaway</option>
                  <option value="Wheelchair">Wheelchair</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-xs font-medium text-slate-600">
                Room number
                <input
                  value={newExtraRoom}
                  onChange={(event) => setNewExtraRoom(event.target.value)}
                  placeholder="e.g. 405"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-400 focus:outline-none"
                />
              </label>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                Add Request
              </button>
            </form>
          </div>

          <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">WhatsApp Summary</h2>
                <p className="text-xs text-slate-500">Review, copy, or send directly to the supervisor.</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p className="whitespace-pre-wrap break-words">{message}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
              >
                {copied ? 'Copied!' : 'Copy message'}
              </button>
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-500 px-4 py-2 text-sm font-medium text-emerald-600 transition hover:bg-emerald-50"
              >
                Send via WhatsApp
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
