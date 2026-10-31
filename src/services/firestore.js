import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  setDoc
} from 'firebase/firestore'
import { db } from './firebase.js'

const PRODUCTS_COLLECTION = 'products'

const productsCollection = collection(db, PRODUCTS_COLLECTION)

function toProduct(snapshot) {
  return { id: snapshot.id, ...snapshot.data() }
}

export async function fetchProducts() {
  const snapshot = await getDocs(productsCollection)
  return snapshot.docs.map(toProduct)
}

export function subscribeProducts(onNext, onError) {
  return onSnapshot(
    productsCollection,
    (snapshot) => onNext(snapshot.docs.map(toProduct)),
    onError
  )
}

export async function fetchProduct(id) {
  const snapshot = await getDoc(doc(db, PRODUCTS_COLLECTION, id))
  return snapshot.exists() ? toProduct(snapshot) : null
}

export async function saveProduct(product) {
  await setDoc(doc(db, PRODUCTS_COLLECTION, product.id), product)
  return product
}

export async function deleteProduct(id) {
  await deleteDoc(doc(db, PRODUCTS_COLLECTION, id))
}


